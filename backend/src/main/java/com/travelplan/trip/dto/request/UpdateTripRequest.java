package com.travelplan.trip.dto.request;

import com.travelplan.trip.TripConstraints;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

// IDはPath Parameterで受け取るため含めない。CreateTripRequestと構造は一致するが、将来の仕様差を考慮し統合していない
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
