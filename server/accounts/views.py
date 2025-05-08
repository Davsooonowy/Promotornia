from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from . import permissions
from . import serializers
from . import models


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

class TagListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            {"tags": serializers.TagSerializer(models.Tag.objects.all(), many=True).data},
            status=status.HTTP_200_OK
        )

class TagView(APIView):
    permission_classes = [permissions.IsSupervisor]

    def post(self, request):
        serializer = serializers.TagSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tag = serializer.save()
        return Response(serializers.TagSerializer(tag).data, status=status.HTTP_201_CREATED)

class MyTagView(APIView):

    permission_classes = [permissions.IsSupervisor]

    def get(self, request):
        tags = request.user.tags
        return Response({"tags": serializers.TagSerializer(tags, many=True).data}, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = serializers.UpdateTagsSerializer(
            instance=user,
            data=request.data
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response({"tags": serializers.TagSerializer(user.tags, many=True).data}, status=status.HTTP_200_OK)
