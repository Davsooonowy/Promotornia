from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.pagination import PageNumberPagination

from . import serializers
from . import models

from accounts import permissions
import os


ITEMS_PER_PAGE = os.getenv('ITEMS_PER_PAGE')

class TagListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            serializers.TagSerializer(models.Tag.objects.all(), many=True).data,
            status=status.HTTP_200_OK
        )

class MyTagView(APIView):

    permission_classes = [permissions.IsSupervisor]

    def get(self, request):
        tags = request.user.tags
        return Response(serializers.TagSerializer(tags, many=True).data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = serializers.UpdateTagsSerializer(
            instance=user,
            data=request.data
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(status=status.HTTP_200_OK)

class ThesisView(APIView):

    permission_classes = [permissions.IsSupervisor]

    def post(self, request):
        serializer = serializers.CreateThesisSerializer(data=request.data, context={"user": request.user})
        if serializer.is_valid():
            thesis = serializer.save()
            return Response(serializers.ThesisSerializer(thesis).data, status=status.HTTP_201_CREATED)

        return Response(request.data, status=status.HTTP_400_BAD_REQUEST)

    # TODO: object ownership
    def get(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis = thesis[0]
            return Response(serializers.ThesisSerializer(thesis).data, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

class ThesisListView(APIView):

    def get(self, request):

        serializer = serializers.ListThesesSerializer(data=request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data.get('ownerEmail')
        field_of_study = serializer.validated_data.get('fieldOfStudy')
        tags = serializer.validated_data.get('tags')

        objects = models.Thesis.objects.all()
        if email is not None:
            objects = objects.filter(owner__email=email)
        if field_of_study is not None:
            objects = objects.filter(owner__field_of_study__id=field_of_study)
        if tags is not None:
            objects = objects.filter(tags__in=tags)

        paginator = PageNumberPagination()
        paginator.page_size = ITEMS_PER_PAGE

        resp = paginator.paginate_queryset(objects, request)

        return Response(serializers.ThesisSerializer(resp, many=True).data, status=status.HTTP_200_OK)

class SupervisorListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = serializers.ListSupervisorsSerializer(data=request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        field_of_study = serializer.validated_data.get('fieldOfStudy')
        tags = serializer.validated_data.get('tags')

        objects = models.SystemUser.objects.filter(is_supervisor=True)

        print(field_of_study)
        if field_of_study is not None:
            objects = objects.filter(field_of_study__id=field_of_study)
        if tags is not None:
            objects = objects.filter(tags__in=tags)

        paginator = PageNumberPagination()
        paginator.page_size = ITEMS_PER_PAGE
        resp = paginator.paginate_queryset(objects, request)

        return Response(serializers.UserSerializer(resp, many=True).data, status=status.HTTP_200_OK)
