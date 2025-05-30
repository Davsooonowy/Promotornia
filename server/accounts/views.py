from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from .models import OneTimePasswordLink
from django.utils.http import urlencode
from django.http import HttpResponseGone
from django.utils import timezone
from datetime import timedelta
from . import permissions, models
from . import serializers
import os


class RegisterView(APIView):

    def post(self, request):
        serializer = serializers.RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'token': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeanView(APIView):
    permission_classes = (IsAuthenticated, permissions.IsDean)

    def post(self, request):
        serializer = serializers.DeanCreateUsersSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            # mailing logic
            for user in result:
                otp = OneTimePasswordLink.objects.create(
                    user=user,
                    expires_at=timezone.now() + timedelta(hours=1)
                )
                url = f"{os.getenv('CORS_ALLOWED_ORIGINS')}/set_password?{urlencode({'token': str(otp.token)})}"
                send_mail(
                    subject='Ustaw swoje hasło',
                    message=f"Otwórz link, aby ustawić hasło:\n\n{url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        serializer = serializers.DeanDeleteUsersSerializer(data=request.data)
        if serializer.is_valid():
            users = serializer.validated_data
            users.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = serializers.LoginSerializer


class OneTimePasswordView(APIView):
    def get(self, request):
        token = request.query_params.get("token")
        try:
            link = OneTimePasswordLink.objects.get(token=token, used=False)
        except OneTimePasswordLink.DoesNotExist:
            return HttpResponseGone("Ten link wygasł lub został już użyty.")
        
        if link.is_expired():
                return HttpResponseGone("Ten link wygasł.")

        return Response({"email": link.user.email}, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = serializers.SetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            try:
                link = OneTimePasswordLink.objects.get(token=token, used=False)
            except OneTimePasswordLink.DoesNotExist:
                return HttpResponseGone("Ten link wygasł lub został już użyty.")

            if link.is_expired():
                return HttpResponseGone("Ten link wygasł.")

            user = link.user
            user.set_password(password)
            user.save()

            link.used = True
            link.save()

            return Response({"message": "Hasło zostało ustawione pomyślnie."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        print(request.data)
        serializer = serializers.ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = serializers.PersonalDataSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = serializers.PersonalDataSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FieldOfStudyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fields_of_study = models.FieldOfStudy.objects.all()
        serializer = serializers.FieldOfStudySerializer(fields_of_study, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = serializers.FieldOfStudySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        field_of_study = models.FieldOfStudy.objects.get(pk=pk)
        serializer = serializers.FieldOfStudySerializer(field_of_study, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        field_of_study = models.FieldOfStudy.objects.get(pk=pk)
        field_of_study.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
