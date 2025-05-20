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
from django.db import models
from django.http import HttpResponseGone

from . import serializers
from . import permissions
from . import serializers


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
            serializer.save()
            # mailing logic
            for user in serializer.plaintext_credentials:
                user = models.SystemUser.objects.get(email=user["email"])
                otp = OneTimePasswordLink.objects.create(
                    user=user,
                    plaintext_password=user["password"]
                )
                token = str(otp.token)
                url = request.build_absolute_uri(
                    reverse("view_password") + "?" + urlencode({"token": token})
                )
                send_mail(
                    subject='Twoje konto zostało utworzone',
                    message=f"Otwórz swój jednorazowy link, aby zobaczyć swoje hasło:\n\n{url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user["email"]],
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

        password = link.plaintext_password
        link.used = True
        link.save()
        return Response({"email": link.user.email, "password": password}, status=status.HTTP_200_OK)
