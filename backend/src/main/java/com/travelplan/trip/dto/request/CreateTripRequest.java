package com.travelplan.trip.dto.request;

import com.travelplan.trip.TripConstraints;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 旅行計画登録APIのリクエストボディ。
 * 開始日・終了日の前後関係チェックはフィールド単体のBean Validationでは表現できないため、
 * {@link com.travelplan.trip.service.TripService} 側で業務ルールとして検証する。
 */
public record CreateTripRequest(
        @NotBlank(message = "旅行名は必須です")
        @Size(max = TripConstraints.NAME_MAX_LENGTH, message = "旅行名は" + TripConstraints.NAME_MAX_LENGTH + "文字以内で入力してください")
        String name,

        @NotNull(message = "開始日は必須です")
        LocalDate startDate,

        @NotNull(message = "終了日は必須です")
        LocalDate endDate,

        @Size(max = TripConstraints.MEMO_MAX_LENGTH, message = "メモは" + TripConstraints.MEMO_MAX_LENGTH + "文字以内で入力してください")
        String memo
) {
}
