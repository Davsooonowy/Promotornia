from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from . import permissions, models
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
            # TODO: mailing logic
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

class FieldOfStudyListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fields_of_study = models.FieldOfStudy.objects.filter(
            systemuser=request.user
        )
        data = serializers.FieldOfStudySerializer(fields_of_study, many=True).data
        for fos in data:
            fos.pop("description", None)
        return Response({"fields_of_study": data}, status=status.HTTP_200_OK)
