
from rest_framework import serializers
from . import models
from accounts  import models as account_models
from accounts import serializers as account_serializers
import os

MAX_PRODUCERS = int(os.getenv('MAX_PRODUCER_COUNT'))
ALLOWED_THESIS_ORDERS = os.getenv('ALLOWED_THESIS_ORDERS').split(',')
ALLOWED_SUPERVISOR_ORDERS = os.getenv('ALLOWED_SUPERVISOR_ORDERS').split(',')

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tag
        fields = '__all__'

    def create(self, validated_data):
        tag = models.Tag.objects.create(**validated_data)
        return tag

def validate_tags(tag_ids):
    valid_tags = models.Tag.objects.filter(id__in=tag_ids)
    if valid_tags.count() < len(tag_ids):
        invalid_tags = set(tag_ids).difference(map(lambda t: t.id, valid_tags))
        if len(invalid_tags) == 1:
            message = f"Tag {invalid_tags.pop()} nie istnieje w bazie danych"
        else:
            message = f"Tagi {', '.join(map(str, invalid_tags))} nie istnieją w bazie"
        raise serializers.ValidationError(message)

    return valid_tags

class ThesisSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    owner = account_serializers.UserSerializer(read_only=True)
    producer = account_serializers.UserSerializer(read_only=True)
    field_of_study = account_serializers.FieldOfStudySerializer(read_only=True)

    class Meta:
        model = models.Thesis
        fields = '__all__'

class CreateThesisSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=255)
    description = serializers.CharField()
    tags = serializers.ListField(default=[])
    producer = serializers.EmailField(default=None)
    field_of_study = serializers.IntegerField()

    def validate(self, attrs):
        producer_email = attrs.get('producer')

        if producer_email is not None:
            try:
                producer = account_models.SystemUser.objects.get(
                    email=producer_email,
                    is_student=True
                )

                attrs['producer'] = producer
            except account_models.SystemUser.DoesNotExist:
                raise serializers.ValidationError("Podany student nie istnieje")

        user: account_models.SystemUser = self.context['user']
        field_of_study_id = attrs.get('field_of_study')
        if not user.field_of_study.filter(id=field_of_study_id).exists():
            raise serializers.ValidationError(f"ID kierunku {field_of_study_id} nie jest przypisane do Ciebie")
        field_of_study = account_models.FieldOfStudy.objects.get(id=field_of_study_id)
        attrs['field_of_study'] = field_of_study

        tag_ids = attrs.get('tags')
        valid_tags = validate_tags(tag_ids)

        attrs['tags'] = valid_tags
        return attrs

    def create(self, validated_data: dict):
        validated_data['owner'] = self.context['user']
        tags = validated_data.pop('tags')
        thesis = models.Thesis.objects.create(**validated_data)
        thesis.tags.add(*tags)
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
            valid_tags = validate_tags(tag_ids)
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
            valid_tags = validate_tags(tag_ids)
            attrs['tags'] = valid_tags

        if order is not None and order.lower() not in ALLOWED_SUPERVISOR_ORDERS:
            raise serializers.ValidationError(f"Nie można uporządkować danych po {order}")

        return attrs
