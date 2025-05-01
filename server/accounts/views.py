from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from . import serializers
from . import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


class RegisterView(APIView):

    def post(self, request):
        serializer = serializers.RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeanView(APIView):

    permission_classes = (IsAuthenticated, permissions.IsDean)

    def post(self, request):
        serializer = serializers.DeanCreateUsersSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            resp = {
                "email": user.email for user in result
            }
        return Response(serializer.errors, status=status.HTTP_201_CREATED)
