package com.travelplan.trip.dto.response;

import com.travelplan.trip.entity.Trip;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * 旅行計画APIのレスポンスボディ。
 * Entityをそのまま返さず、公開して問題ないフィールドのみを明示的に選択する。
 */
public record TripResponse(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String memo,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    private static final ZoneId DISPLAY_ZONE = ZoneId.of("Asia/Tokyo");

    public static TripResponse from(Trip trip) {
        return new TripResponse(
                trip.getId(),
                trip.getName(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getMemo(),
                toDisplayZone(trip.getCreatedAt()),
                toDisplayZone(trip.getUpdatedAt())
        );
    }

    private static OffsetDateTime toDisplayZone(OffsetDateTime value) {
        return value.atZoneSameInstant(DISPLAY_ZONE).toOffsetDateTime();
    }
}
