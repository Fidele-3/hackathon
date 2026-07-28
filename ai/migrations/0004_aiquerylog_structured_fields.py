from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ai", "0003_alter_aiquerylog_input_image"),
    ]

    operations = [
        migrations.AddField(
            model_name="aiquerylog",
            name="structured_response",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="aiquerylog",
            name="severity",
            field=models.CharField(
                blank=True,
                choices=[("high", "High"), ("medium", "Medium"), ("low", "Low")],
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="aiquerylog",
            name="language",
            field=models.CharField(default="en", max_length=5),
        ),
        migrations.AlterField(
            model_name="aiquerylog",
            name="query_type",
            field=models.CharField(
                choices=[
                    ("crop_diagnosis", "Crop disease diagnosis"),
                    ("livestock_query", "Livestock query"),
                    ("general_qa", "General farming Q&A"),
                    ("insight_generation", "Aggregate insight generation"),
                    ("voice", "Voice transcription"),
                ],
                max_length=30,
            ),
        ),
        migrations.AddIndex(
            model_name="aiquerylog",
            index=models.Index(fields=["was_escalated", "severity", "created_at"], name="ai_aiqueryl_was_esc_idx"),
        ),
    ]
