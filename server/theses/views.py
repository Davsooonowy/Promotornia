from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from . import serializers
from . import models

from accounts import permissions

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
        print(request.GET)

        return Response(request.GET, status=status.HTTP_200_OK)
