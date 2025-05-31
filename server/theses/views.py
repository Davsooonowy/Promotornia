from humps.main import decamelize
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.pagination import PageNumberPagination

from . import serializers
from . import models

from django.db.models import Count, F, Value, Q, ExpressionWrapper, IntegerField
from django.db.models.functions import Concat

from accounts import permissions as account_permissions
from accounts import serializers as account_serializers
from accounts import models as account_models

import os

ITEMS_PER_PAGE = os.getenv('ITEMS_PER_PAGE')
THESIS_STATUSES = os.getenv('THESIS_STATUSES').split(',')

class ThesisView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis = thesis[0]
            resp = serializers.ThesisSerializer(thesis).data
            return Response(resp, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, thesis_id):
        try:
            thesis = models.Thesis.objects.get(id=thesis_id)
        except models.Thesis.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        data = decamelize(request.data)

        if (
            thesis.status.lower() in ["zatwierdzony", "student zaakceptowany"] or
            (thesis.status.lower() != "ukryty" and data.get("field_of_study") is not None)
        ):
            return Response({"message": "Nieodpowiedni status do modyfikacji"}, status=status.HTTP_403_FORBIDDEN)


        serializer = serializers.UpdateThesisSerializer(
            instance=thesis,
            data=data,
            context={"user": request.user}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, thesis_id):
        thesis = models.Thesis.objects.filter(id=thesis_id)
        if thesis.count() > 0:
            thesis = thesis[0]
            if thesis.owner != request.user:
                return Response(status=status.HTTP_403_FORBIDDEN)
            thesis.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)

class CreateThesisView(APIView):
    permission_classes = [account_permissions.IsSupervisor]

    def get(self, request):
        user = request.user
        owned_theses = models.Thesis.objects.filter(
            owner=user,
        )
        if owned_theses.count() >= user.total_spots:
            return Response(
                {"message": "Maksymalna liczba dozwolonych prac osiągnięta"},
                status=status.HTTP_403_FORBIDDEN
            )

        thesis = models.Thesis.objects.create(
            owner=request.user,
            description="Podaj opis pracy",
            prerequisites="Podaj opis wymagań wstępnych",

        )
        thesis.name = f"Praca nr. {thesis.id}. Podaj nazwę pracy"
        thesis.save()
        return Response({"id": thesis.id}, status=status.HTTP_200_OK)

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
            full_name=Concat(F('owner__first_name'), Value(' '), F('owner__last_name'))
        )

        if field_of_study is not None:
            objects = objects.filter(field_of_study__id=field_of_study)

        if tags is not None:
            objects = objects.filter(tags__in=tags)

        if search is not None:
            objects = (objects.filter(
                Q(name__icontains=search) | Q(full_name__icontains=search))
            )

        if available is not None:
            if available == "available":
                objects = objects.filter(status="Dostępny")
            else:
                objects = objects.exclude(status="Dostępny")

        objects = objects.exclude(status="Ukryty")

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
            record.pop('prerequisites', None)
            if (field := record.get('field_of_study')) is not None:
                field.pop('description', None)
            record.pop('producer', None)

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

        taken = ['Zarezerwowany', 'Student zaakceptowany', 'Zatwierdzony']
        objects = objects.annotate(
            full_name=Concat(F('first_name'), Value(' '), F('last_name')),
            taken_spots=Count(
                'owned_theses',
                filter=Q(owned_theses__status__in=taken)
            ),
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

class TagListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        tags = models.Tag.objects.all()
        tags = serializers.TagSerializer(tags, many=True).data
        return Response(
            {"tags": tags},
            status=status.HTTP_200_OK
        )

class TagView(APIView):
    permission_classes = [account_permissions.IsSupervisor]

    def post(self, request):
        serializer = serializers.TagSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tag = serializer.save()
        return Response(serializers.TagSerializer(tag).data, status=status.HTTP_201_CREATED)

class SupervisorThesesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, supervisor_id):
        supervisor = account_models.SystemUser.objects.filter(
            id=supervisor_id, is_supervisor=True
        ).first()
        if not supervisor:
            return Response(
                {"error": "Supervisor not found"}, status=status.HTTP_404_NOT_FOUND
            )

        theses = models.Thesis.objects.filter(owner=supervisor).annotate(
            full_name=Concat(F('owner__first_name'), Value(' '), F('owner__last_name'))
        )

        paginator = PageNumberPagination()
        paginator.page_size = ITEMS_PER_PAGE
        paginated_theses = paginator.paginate_queryset(theses, request)

        data = serializers.ThesisSerializer(paginated_theses, many=True).data

        for record in data:
            record.pop('description', None)
            record.pop('prerequisites', None)
            if (field := record.get('field_of_study')) is not None:
                field.pop('description', None)
            record.pop('producer', None)

        return Response({"theses": data}, status=status.HTTP_200_OK)

class SupervisorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, supervisor_id):
        supervisor = account_models.SystemUser.objects.filter(
            id=supervisor_id, is_supervisor=True
        ).first()
        if not supervisor:
            return Response(
                {"error": "Supervisor not found"}, status=status.HTTP_404_NOT_FOUND
            )

        data = account_serializers.SupervisorSerializer(supervisor).data
        return Response(data, status=status.HTTP_200_OK)