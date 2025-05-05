
from rest_framework import serializers
from . import models

MAX_PRODUCERS = 2

class ThesisSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Thesis
        fields = '__all__'

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

        tags = models.Tag.objects.filter(name__in=attrs.get('tags', []))
        invalid_tags = set(tags).difference(set(map(lambda t: t.name, tags)))
        if len(invalid_tags) > 0:
            if len(invalid_tags) == 1:
                message = f"Tag {invalid_tags.pop()} nie istnieje w bazie danych"
            else:
                message = f"Tagi {', '.join(invalid_tags)} nie istnieją w bazie danych"
            raise serializers.ValidationError(message)

        attrs['tags'] = tags
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
