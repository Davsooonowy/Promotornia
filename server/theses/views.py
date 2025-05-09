from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.pagination import PageNumberPagination

from . import serializers
from . import models

from django.db.models import Count, F, Value, Q, Sum, ExpressionWrapper, IntegerField
from django.db.models.functions import Concat, Coalesce

from accounts import permissions as account_permissions
from accounts import serializers as account_serializers
from accounts import models as account_models

import os


ITEMS_PER_PAGE = os.getenv('ITEMS_PER_PAGE')

class ThesisView(APIView):

    permission_classes = [account_permissions.IsSupervisor]

    def post(self, request):
        serializer = serializers.CreateThesisSerializer(data=request.data, context={"user": request.user})
        if serializer.is_valid():
            thesis = serializer.save()
            return Response(serializers.ThesisSerializer(thesis).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis = thesis[0]
            if thesis.owner != request.user:
                return Response(status=status.HTTP_403_FORBIDDEN)
            thesis.free_spots = thesis.producer_limit - thesis.producers.count()
            return Response(serializers.ThesisSerializer(thesis).data, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis = thesis[0]
            if thesis.owner != request.user:
                return Response(status=status.HTTP_403_FORBIDDEN)
            thesis.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

class ThesisListView(APIView):

    def get(self, request):

        serializer = serializers.ListThesesSerializer(data=request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        field_of_study = serializer.validated_data.get('fieldOfStudy')
        tags = serializer.validated_data.get('tags')
        search = serializer.validated_data.get('search')
        available = serializer.validated_data.get('available')
        order = serializer.validated_data.get('order')
        ascending = serializer.validated_data.get('ascending')

        objects = models.Thesis.objects.all().annotate(
            full_name=Concat(F('owner__first_name'), Value(' '), F('owner__last_name')),
            num_producers=Count('producers'),
            free_spots=ExpressionWrapper(
                F('producer_limit') - F('num_producers'),
                output_field=IntegerField()
            )
        )
        if field_of_study is not None:
            objects = objects.filter(owner__field_of_study__id=field_of_study)
        if tags is not None:
            objects = objects.filter(tags__in=tags)
        if available is not None:
            if available:
                objects = objects.filter(num_producers__lt=F('producer_limit'))
            else:
                objects = objects.filter(num_producers__exact=F('producer_limit'))
        if search is not None:
            objects = (objects
                       .filter(Q(name__icontains=search) | Q(full_name__icontains=search)))
        if order is not None:
            desc = '' if ascending else '-'
            match order:
                case 'title':
                    objects = objects.order_by(f"{desc}name")
                case 'supervisor':
                    objects = objects.order_by(f"{desc}full_name")
                case 'date':
                    objects = objects.order_by(f"{desc}date_of_creation")

        paginator = PageNumberPagination()
        paginator.page_size = ITEMS_PER_PAGE
        resp = paginator.paginate_queryset(objects, request)

        data = serializers.ThesisSerializer(resp, many=True).data

        for record in data:
            record.pop('description', None)
            record['field_of_study'].pop('description', None)
            record.pop('producers', None)

        return Response({"theses": data}, status=status.HTTP_200_OK)

class SupervisorListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = serializers.ListSupervisorsSerializer(data=request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        field_of_study = serializer.validated_data.get('fieldOfStudy')
        tags = serializer.validated_data.get('tags')
        search = serializer.validated_data.get('search')
        order = serializer.validated_data.get('order')
        ascending = serializer.validated_data.get('ascending')

        objects = account_models.SystemUser.objects.filter(is_supervisor=True)

        objects = objects.annotate(
            full_name=Concat(F('first_name'), Value(' '), F('last_name')),
            total_spots=Coalesce(Sum('owned_theses__producer_limit'), 0),
            taken_spots=Count('owned_theses__producers'),
            free_spots = ExpressionWrapper(
                F('total_spots') - F('taken_spots'),
                output_field=IntegerField()
            ),
        )

        if field_of_study is not None:
            objects = objects.filter(field_of_study__id=field_of_study)
        if tags is not None:
            objects = objects.filter(tags__in=tags)
        if search is not None:
            objects = objects.filter(full_name__icontains=search)
        if order is not None:
            desc = '' if ascending else '-'
            match order:
                case 'last_name':
                    objects = objects.order_by(f'{desc}last_name')
                case 'free_spots':
                    objects = objects.order_by(f'{desc}free_spots')

        paginator = PageNumberPagination()
        paginator.page_size = ITEMS_PER_PAGE
        resp = paginator.paginate_queryset(objects, request)

        data = account_serializers.SupervisorSerializer(resp, many=True).data
        for record in data:
            for field in record['field_of_study']:
                field.pop('description', None)

        return Response({"supervisors": data}, status=status.HTTP_200_OK)
