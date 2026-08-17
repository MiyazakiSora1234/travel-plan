package com.travelplan.trip.dto.request;

import com.travelplan.trip.TripConstraints;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 旅行計画更新APIのリクエストボディ。
 * 更新対象のIDはURL Path Parameterで受け取るため、ここには含めない。
 * 開始日・終了日の前後関係チェックはフィールド単体のBean Validationでは表現できないため、
 * {@link com.travelplan.trip.service.TripService} 側で業務ルールとして検証する。
 *
 * <p>フィールド構成はCreateTripRequestと現在一致しているが、POST（新規作成）とPUT（全体更新）は
 * 別の操作でありUpdateでは項目が任意になる、のような仕様差が将来入る可能性があるため、
 * 意図的にDTOとしては統合していない（一致しているのは値の制約のみで、TripConstraintsとして
 * 共有している）。</p>
 */
public record UpdateTripRequest(
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
