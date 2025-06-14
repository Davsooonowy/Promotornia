from humps.main import decamelize
from rest_framework.generics import ListAPIView
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
        fos = thesis.field_of_study
        target_fos = data.get("field_of_study")
        if target_fos is not None:
            target_fos_id = target_fos.get("id")
            if target_fos_id is not None:
                try:
                    target_fos = account_models.FieldOfStudy.objects.get(id=target_fos_id)
                except account_models.FieldOfStudy.DoesNotExist:
                    return Response({"message": "Podany kierunek studiów nie istnieje!"}, status=status.HTTP_400_BAD_REQUEST)
        if target_fos is None:
            target_fos = {}
            data["field_of_study"] = target_fos
        if (
            thesis.status.lower() in ["zatwierdzony", "student zaakceptowany"] or
            (thesis.status.lower() != "ukryty" and None is not fos != target_fos)
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
            if (
                thesis.owner != request.user or
                thesis.status.lower() != "ukryty"
            ):
                return Response(status=status.HTTP_403_FORBIDDEN)
            thesis.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_404_NOT_FOUND)
    
class ThesisStatus(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, thesis_id):
        try:
            thesis = models.Thesis.objects.get(id=thesis_id)
        except models.Thesis.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        user = request.user
        data = decamelize(request.data)
        new_status = data.get("status")

        if new_status is None:
            return Response({"message": "Brak statusu w żądaniu"}, status=status.HTTP_400_BAD_REQUEST)

        current_status = thesis.status

        if (
            "ukryty" == current_status.lower() != new_status.lower() and
            thesis.field_of_study is data.get("field_of_study") is None
        ):
            return Response(
                {"message": "Nie można opublikować pracy dyplomowej bez ustawienia kierunku studiów!"},
                status=status.HTTP_403_FORBIDDEN
            )

        valid_transitions = {
            ("Ukryty", "Dostępny"): ["supervisor"],
            ("Dostępny", "Ukryty"): ["supervisor"],
            ("Zarezerwowany", "Ukryty"): ["supervisor"],
            ("Dostępny", "Zarezerwowany"): ["student"],
            ("Zarezerwowany", "Student zaakceptowany"): ["supervisor"],
            ("Student zaakceptowany", "Zatwierdzony"): ["student"],
            ("Zarezerwowany", "Dostępny"): ["student", "supervisor"],
            ("Student zaakceptowany", "Dostępny"): ["student"],
        }
        if (current_status, new_status) not in valid_transitions:
            return Response({"message": f"Nie można zmienić statusu z '{current_status}' na '{new_status}'"},
                            status=status.HTTP_403_FORBIDDEN)

        required_roles = valid_transitions[(current_status, new_status)]

        if "student" in required_roles and user.is_student:
            pass  # OK
        elif "supervisor" in required_roles and user.is_supervisor:
            if thesis.owner != user:
                return Response({"message": "Nie jesteś promotorem tej pracy"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"message": "Nie masz uprawnień do wykonania tej zmiany"}, status=status.HTTP_403_FORBIDDEN)

        if user.is_student:
            if (current_status, new_status) == ("Dostępny", "Zarezerwowany"):
                thesis.producer = user
            elif thesis.producer != user:
                return Response({"message": "Nie jesteś przypisanym studentem"}, status=status.HTTP_403_FORBIDDEN)
            
        if new_status == "Dostępny" or new_status == "Ukryty":
            thesis.producer = None

        thesis.status = new_status
        thesis.save()
        return Response({"message": "Status został zmieniony"}, status=status.HTTP_200_OK)

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

class ThesisListView(ListAPIView):
    serializer_class = serializers.ThesisSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        serializer = serializers.ListThesesSerializer(data=self.request.GET)
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
        if self.request.user.is_student:
            objects = objects.filter(field_of_study__in=self.request.user.field_of_study.values_list('id', flat=True))

        if field_of_study is not None:
            objects = objects.filter(field_of_study__id=field_of_study)

        if tags is not None:
            objects = objects.filter(tags__in=tags).distinct()

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
        return objects

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["discarded_fields"] = ["description", "prerequisites", "producer"]
        return context

class SupervisorListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    serializer_class = account_serializers.SupervisorSerializer

    def get_queryset(self):
        serializer = serializers.ListSupervisorsSerializer(data=self.request.GET)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        field_of_study = serializer.validated_data.get('fieldOfStudy')
        search = serializer.validated_data.get('search')
        order = serializer.validated_data.get('order')
        available = serializer.validated_data.get('available')
        ascending = serializer.validated_data.get('ascending')

        objects = account_models.SystemUser.objects.filter(is_supervisor=True)

        taken = ['Zarezerwowany', 'Student zaakceptowany', 'Zatwierdzony']
        objects = objects.annotate(
            full_name=Concat(F('first_name'), Value(' '), F('last_name')),
            thesis_count=Count('owned_theses'),
            taken_spots=Count(
                'owned_theses',
                filter=Q(owned_theses__status__in=taken)
            ),
            free_spots=ExpressionWrapper(
                F('thesis_count') - F('taken_spots'),
                output_field=IntegerField()
            ),
        )

        if self.request.user.is_student:
            objects = objects.filter(field_of_study__in=self.request.user.field_of_study.values_list('id', flat=True)).distinct()
        if field_of_study is not None:
            objects = objects.filter(field_of_study__id=field_of_study)
        if search is not None:
            objects = objects.filter(full_name__icontains=search)
        if order is not None:
            desc = '' if ascending else '-'
            match order:
                case 'last_name':
                    objects = objects.order_by(f'{desc}last_name')
                case 'free_spots':
                    objects = objects.order_by(f'{desc}free_spots')
        if available:
            objects = objects.exclude(free_spots=0)
        return objects

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

        data = serializers.ThesisSerializer(theses, many=True).data

        for record in data:
            record.pop('description', None)
            record.pop('prerequisites', None)
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
        taken_spots = supervisor.owned_theses.filter(
            status__in=["Zarezerwowany", "Zatwierdzony", "Student zaakceptowany"]
        ).count()
        thesis_count = supervisor.owned_theses.count()
        data["thesis_count"] = thesis_count
        data["free_spots"] = thesis_count - taken_spots
        return Response(data, status=status.HTTP_200_OK)

class ThesisByProducerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, producer_id):
        thesis = models.Thesis.objects.filter(producer_id=producer_id).first()
        if not thesis:
            return Response(
                {"error": "Thesis not found for the given producer ID"},
                status=status.HTTP_404_NOT_FOUND
            )
        data = serializers.ThesisSerializer(thesis).data
        return Response(data, status=status.HTTP_200_OK)

class AvailableStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        thesis_id = request.query_params.get("thesis_id")
        if not thesis_id:
            return Response({"message": "Brak ID pracy."}, status=400)
        try:
            thesis = models.Thesis.objects.get(id=thesis_id)
        except models.Thesis.DoesNotExist:
            return Response({"message": "Nie znaleziono pracy."}, status=404)
        field_of_study = thesis.field_of_study
        students = account_models.SystemUser.objects.filter(
            is_student=True,
            field_of_study=field_of_study,
            thesis_producer__isnull=True
        )
        data = [
            {
                "id": s.id,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "email": s.email,
            }
            for s in students
        ]
        return Response({"students": data})

class AssignStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, thesis_id):
        try:
            thesis = models.Thesis.objects.get(id=thesis_id)
        except models.Thesis.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if thesis.status != "Dostępny" or thesis.owner != request.user:
            return Response({"message": "Nie można przypisać studenta."}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get("producer_id")
        if not student_id:
            return Response({"message": "Brak ID studenta."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = account_models.SystemUser.objects.get(id=student_id, is_student=True)
        except account_models.SystemUser.DoesNotExist:
            return Response({"message": "Nie znaleziono studenta."}, status=status.HTTP_400_BAD_REQUEST)

        if models.Thesis.objects.filter(producer_id=student_id).exists():
            return Response({"message": "Student już ma przypisaną pracę."}, status=status.HTTP_400_BAD_REQUEST)

        thesis.producer = student
        thesis.status = "Zarezerwowany"
        thesis.save()
        return Response(status=status.HTTP_200_OK)