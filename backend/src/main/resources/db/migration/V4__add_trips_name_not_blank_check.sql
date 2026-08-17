-- Bean Validation(@NotBlank)はAPI経由の入力のみを守るため、DBへ直接書き込まれる空白名を
-- 最終防衛として拒否する。適用前に既存データを確認済み（違反行なし）。
ALTER TABLE trips
    ADD CONSTRAINT chk_trips_name_not_blank CHECK (length(trim(name)) > 0);
