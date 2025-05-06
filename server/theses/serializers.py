
from rest_framework import serializers
from . import models
from accounts.models import FieldOfStudy

MAX_PRODUCERS = 2

def validate_tags(tag_ids):
    valid_tags = models.Tag.objects.filter(id__in=tag_ids)
    if valid_tags.count() < len(tag_ids):
        invalid_tags = set(tag_ids).difference(map(lambda t: t.id, valid_tags))
        if len(invalid_tags) == 1:
            message = f"Tag {invalid_tags.pop()} nie istnieje w bazie danych"
        else:
            message = f"Tagi {', '.join(invalid_tags)} nie istnieją w bazie"
        raise serializers.ValidationError(message)

    return valid_tags

# TODO: move to accounts after merge
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SystemUser
        fields = ('id', 'email', 'first_name', 'last_name')

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tag
        fields = '__all__'

class ThesisSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = models.Thesis
        fields = '__all__'

class UpdateTagsSerializer(serializers.Serializer):
    tags = serializers.ListField(default=[])

    def validate(self, attrs):
        tag_ids = attrs.get('tags')
        valid_tags = validate_tags(tag_ids)
        attrs['tags'] = valid_tags
        return attrs

    def update(self, instance, validated_data):
        tags = validated_data.get('tags')
        instance.tags.set(tags)
        instance.save()
        return instance

class CreateThesisSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=255)
    description = serializers.CharField()
    tags = serializers.ListField(default=[])
    producers = serializers.ListField(default=[])
    producer_limit = serializers.IntegerField(default=1)

    def validate(self, attrs):
        producer_limit = attrs.get('producer_limit', 1)
        if producer_limit <= 0:
            raise serializers.ValidationError("Nieprawidłowa wartość limitu twórców")
        if producer_limit > MAX_PRODUCERS:
            raise serializers.ValidationError(f"Limit twórców pracy nie może przekroczyć {MAX_PRODUCERS}")
        producer_emails = attrs.get('producers', [])
        if len(producer_emails) > producer_limit:
            raise serializers.ValidationError(f"Przekroczono limit uczestników pracy")

        producers = models.SystemUser.objects.filter(email__in=producer_emails)
        invalid_emails = set(producer_emails).difference(set(map(lambda u: u.email, producers)))
        if len(invalid_emails) > 0:
            if len(invalid_emails) == 1:
                message = f"Adres {invalid_emails.pop()} nie istnieje w bazie danych"
            else:
                message = f"Adresy {', '.join(invalid_emails)} nie istnieją w bazie danych"
            raise serializers.ValidationError(message)

        tag_ids = attrs.get('tags')
        valid_tags = validate_tags(tag_ids)

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

        return thesis

class ListThesesSerializer(serializers.Serializer):
    ownerEmail = serializers.EmailField(default=None)
    fieldOfStudy = serializers.IntegerField(default=None)
    tags = serializers.CharField(default=None)

    def validate(self, attrs):
        tags = attrs.get('tags')
        owner_email = attrs.get('ownerEmail')
        field_of_study = attrs.get('fieldOfStudy')

        if (
            owner_email is not None and
            not models.SystemUser.objects.filter(email=owner_email, is_supervisor=True).exists()
        ):
            raise serializers.ValidationError(f"Nie istnieje promotor o adresie email {owner_email}")

        if (
            field_of_study is not None and
            not FieldOfStudy.objects.filter(id=field_of_study).exists()
        ):
            raise serializers.ValidationError(f"Nie istnieje kierunek studiów o identyfikatorze {field_of_study}")

        if tags is not None:
            try:
                tag_ids = list(map(int, tags.split(',')))
            except ValueError:
                raise serializers.ValidationError("Niepoprawny format identyfikatorów tagów")
            valid_tags = validate_tags(tag_ids)
            attrs['tags'] = valid_tags

        return attrs

class ListSupervisorsSerializer(serializers.Serializer):
    fieldOfStudy = serializers.IntegerField(default=None)
    tags = serializers.CharField(default=None)

    def validate(self, attrs):
        field_of_study = attrs.get('fieldOfStudy')
        tags = attrs.get('tags')
        print(type(field_of_study))

        if (
            field_of_study is not None and
            not FieldOfStudy.objects.filter(id=field_of_study).exists()
        ):
            raise serializers.ValidationError(f"Nie istnieje kierunek studiów {field_of_study}")

        if tags is not None:
            try:
                tag_ids = list(map(int, tags.split(',')))
            except ValueError:
                raise serializers.ValidationError("Niepoprawny format identyfikatorów tagów")
            valid_tags = validate_tags(tag_ids)
            attrs['tags'] = valid_tags

        return attrs
