from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0006_chunkdocumento_mensagens'),
    ]

    operations = [
        # 1. Criar a função de trigger que popula text_search_tsv automaticamente
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE FUNCTION tsvector_update_chunkdocumento()
                RETURNS trigger AS $$
                BEGIN
                    NEW.text_search_tsv := to_tsvector('portuguese', COALESCE(NEW.text, ''));
                    RETURN NEW;
                END
                $$ LANGUAGE plpgsql;
            """,
            reverse_sql="DROP FUNCTION IF EXISTS tsvector_update_chunkdocumento();",
        ),
        # 2. Criar o trigger que executa a função antes de cada INSERT ou UPDATE
        migrations.RunSQL(
            sql="""
                CREATE TRIGGER trg_chunkdocumento_tsvector
                BEFORE INSERT OR UPDATE ON data_rag_chunkdocumento
                FOR EACH ROW
                EXECUTE FUNCTION tsvector_update_chunkdocumento();
            """,
            reverse_sql="DROP TRIGGER IF EXISTS trg_chunkdocumento_tsvector ON data_rag_chunkdocumento;",
        ),
        # 3. Criar o índice GIN para buscas full-text eficientes
        migrations.RunSQL(
            sql="""
                CREATE INDEX IF NOT EXISTS idx_chunkdocumento_tsv
                ON data_rag_chunkdocumento
                USING GIN(text_search_tsv);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_chunkdocumento_tsv;",
        ),
        # 4. Backfill: atualizar todos os registros existentes para popular o text_search_tsv
        migrations.RunSQL(
            sql="""
                UPDATE data_rag_chunkdocumento
                SET text_search_tsv = to_tsvector('portuguese', COALESCE(text, ''))
                WHERE text_search_tsv IS NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
