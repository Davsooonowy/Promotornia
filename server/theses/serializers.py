
from rest_framework import serializers
from . import models
from accounts  import models as account_models
from accounts import serializers as account_serializers
import os

MAX_PRODUCERS = int(os.getenv('MAX_PRODUCER_COUNT'))
ALLOWED_THESIS_ORDERS = os.getenv('ALLOWED_THESIS_ORDERS').split(',')
ALLOWED_SUPERVISOR_ORDERS = os.getenv('ALLOWED_SUPERVISOR_ORDERS').split(',')

class ThesisSerializer(serializers.ModelSerializer):
    tags = account_serializers.TagSerializer(many=True, read_only=True)
    owner = account_serializers.UserSerializer(read_only=True)
    producers = account_serializers.UserSerializer(many=True, read_only=True)
    field_of_study = account_serializers.FieldOfStudySerializer(read_only=True)

    free_spots = serializers.IntegerField()

    class Meta:
        model = models.Thesis
        fields = '__all__'

class CreateThesisSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=255)
    description = serializers.CharField()
    tags = serializers.ListField(default=[])
    producers = serializers.ListField(default=[])
    producer_limit = serializers.IntegerField(default=1)
    field_of_study = serializers.IntegerField()

    def validate(self, attrs):
        producer_limit = attrs.get('producerLimit', 1)
        if producer_limit <= 0:
            raise serializers.ValidationError("Nieprawidłowa wartość limitu twórców")
        if producer_limit > MAX_PRODUCERS:
            raise serializers.ValidationError(f"Limit twórców pracy nie może przekroczyć {MAX_PRODUCERS}")
        producer_emails = attrs.get('producers', [])
        if len(producer_emails) > producer_limit:
            raise serializers.ValidationError("Przekroczono limit uczestników pracy")

        producers = account_models.SystemUser.objects.filter(email__in=producer_emails)
        invalid_emails = set(producer_emails).difference(set(map(lambda u: u.email, producers)))
        if len(invalid_emails) > 0:
            if len(invalid_emails) == 1:
                message = f"Adres {invalid_emails.pop()} nie istnieje w bazie danych"
            else:
                message = f"Adresy {', '.join(invalid_emails)} nie istnieją w bazie danych"
            raise serializers.ValidationError(message)

        user: account_models.SystemUser = self.context['user']
        field_of_study_id = attrs.get('field_of_study')
        if not user.field_of_study.filter(id=field_of_study_id).exists():
            raise serializers.ValidationError(f"ID kierunku {field_of_study_id} nie jest przypisane do Ciebie")
        field_of_study = account_models.FieldOfStudy.objects.get(id=field_of_study_id)
        attrs['field_of_study'] = field_of_study

        tag_ids = attrs.get('tags')
        valid_tags = account_serializers.validate_tags(tag_ids)

        attrs['tags'] = valid_tags
        attrs['producers'] = producers
        return attrs

    def create(self, validated_data: dict):
        tags = validated_data.pop('tags')
        producers = validated_data.pop('producers')
        validated_data['owner'] = self.context['user']
        thesis = models.Thesis.objects.create(**validated_data)
        thesis.tags.add(*tags)
        thesis.producers.add(*producers)

        thesis.free_spots = validated_data.get('producer_limit') - producers.count()

        return thesis

class ListThesesSerializer(serializers.Serializer):
    fieldOfStudy = serializers.IntegerField(default=None)
    tags = serializers.CharField(default=None)
    order = serializers.CharField(default=None)
    ascending = serializers.BooleanField(default=True)
    available = serializers.BooleanField(required=False, allow_null=True)
    search = serializers.CharField(default=None)

    def validate(self, attrs):
        tags = attrs.get('tags')
        field_of_study = attrs.get('fieldOfStudy')

        if (
            field_of_study is not None and
            not account_models.FieldOfStudy.objects.filter(id=field_of_study).exists()
        ):
            raise serializers.ValidationError(f"Nie istnieje kierunek studiów o identyfikatorze {field_of_study}")

        if tags is not None:
            try:
                tag_ids = list(map(int, tags.split(',')))
            except ValueError:
                raise serializers.ValidationError("Niepoprawny format identyfikatorów tagów")
            valid_tags = account_serializers.validate_tags(tag_ids)
            attrs['tags'] = valid_tags

        order = attrs.get('order')
        if order is not None:
            if order.lower() not in ALLOWED_THESIS_ORDERS:
                raise serializers.ValidationError(f"Nie można uporządkować prac dyplomowych po polu \"{order}\". Można po {', '.join(ALLOWED_THESIS_ORDERS)}")

            direction = '' if attrs.get('ascending') else '-'
            attrs['direction'] = direction

        return attrs

class ListSupervisorsSerializer(serializers.Serializer):
    fieldOfStudy = serializers.IntegerField(default=None)
    tags = serializers.CharField(default=None)
    available = serializers.BooleanField(required=False, allow_null=True)
    search = serializers.CharField(default=None)
    order = serializers.CharField(default=None)
    ascending = serializers.BooleanField(default=True)

    def validate(self, attrs):
        field_of_study = attrs.get('fieldOfStudy')
        tags = attrs.get('tags')
        order = attrs.get('order')

        if (
            field_of_study is not None and
            not account_models.FieldOfStudy.objects.filter(id=field_of_study).exists()
        ):
            raise serializers.ValidationError(f"Nie istnieje kierunek studiów {field_of_study}")

        if tags is not None:
            try:
                tag_ids = list(map(int, tags.split(',')))
            except ValueError:
                raise serializers.ValidationError("Niepoprawny format identyfikatorów tagów")
            valid_tags = account_serializers.validate_tags(tag_ids)
            attrs['tags'] = valid_tags

        print(ALLOWED_SUPERVISOR_ORDERS)
        if order is not None and order.lower() not in ALLOWED_SUPERVISOR_ORDERS:
            raise serializers.ValidationError(f"Nie można uporządkować danych po {order}")

        return attrs
