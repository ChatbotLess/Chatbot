from django.db import migrations, models


def normalize_firebase_uid(apps, schema_editor):
    User = apps.get_model("user", "User")
    seen = set()

    for user in User.objects.order_by("id"):
        firebase_uid = str(user.firebase_uid or "").strip()

        if not firebase_uid or firebase_uid == "1" or firebase_uid in seen:
            firebase_uid = f"legacy:{user.id}"
            User.objects.filter(pk=user.pk).update(firebase_uid=firebase_uid)

        seen.add(firebase_uid)


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0002_user_firebase_uid"),
    ]

    operations = [
        migrations.RunPython(normalize_firebase_uid, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="firebase_uid",
            field=models.CharField(max_length=128, unique=True),
        ),
    ]
