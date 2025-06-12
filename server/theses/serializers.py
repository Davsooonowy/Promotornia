
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        discarded_fields = self.context.get("discarded_fields", [])
        for field in discarded_fields:
            data.pop(field, None)
        return data

class UpdateThesisSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, default="")
    field_of_study = serializers.DictField(required=False, default={})
    description = serializers.CharField(required=False, default="")
    prerequisites_description = serializers.CharField(required=False, default="")
    tags = serializers.ListField(required=False, default=[])
    producer_id = serializers.IntegerField(required=False, default=None)

    def validate(self, attrs):
        attrs["name"] = attrs.pop("title")
        attrs["prerequisites"] = attrs.pop("prerequisites_description")
        field_of_study = attrs.pop("field_of_study")
        fos_id = field_of_study.get("id")
        producer_id = attrs.get("producer_id")
        try:
            conflict = models.Thesis.objects.get(
                name=attrs["name"]
            )
            if conflict.id != self.instance.id:
                raise serializers.ValidationError("Praca z daną nazwą już istnieje")
        except models.Thesis.DoesNotExist:
            pass

        if producer_id is not None:
            try:
                account_models.SystemUser.objects.get(
                    id=producer_id,
                    is_student=True
                )
            except account_models.SystemUser.DoesNotExist:
                raise serializers.ValidationError(f"Student o ID {producer_id} nie istnieje")

            try:
                conflict = models.Thesis.objects.get(
                    producer_id=producer_id,
                )
                if conflict.id != self.instance.id:
                    raise serializers.ValidationError(f"Student o ID {producer_id} jest już przypisany do pracy pt. {conflict.name}")
            except models.Thesis.DoesNotExist:
                pass

        if fos_id is not None:
            try:
                field_of_study = account_models.FieldOfStudy.objects.get(
                    id=fos_id,
                    systemuser__in=[self.context["user"]]
                )
            except account_models.FieldOfStudy.DoesNotExist:
                raise serializers.ValidationError(f"Błędny identyfikator kierunku: {fos_id}")
            attrs["field_of_study"] = field_of_study

        tags = attrs["tags"]
        if all(isinstance(t, dict) for t in tags):
            try:
                tags = list(map(lambda t: t["id"], tags))
            except KeyError:
                raise serializers.ValidationError("Niepoprawny format tagów")
        tags = validate_tags(tags)
        attrs["tags"] = tags
        return attrs

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags")
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        instance.tags.set(tags)
        return instance

class ListThesesSerializer(serializers.Serializer):
    fieldOfStudy = serializers.IntegerField(default=None)
    tags = serializers.CharField(default=None)
    order = serializers.CharField(default=None)
    ascending = serializers.BooleanField(default=True)
    available = serializers.CharField(required=False, allow_null=True)
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
