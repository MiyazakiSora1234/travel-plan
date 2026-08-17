package com.travelplan.trip;

/**
 * Trip関連の制約値。CreateTripRequest / UpdateTripRequestの両方で同じ上限値を使うため、
 * マジックナンバーの二重管理を避けてここに集約する。
 * frontend/mobileの{@code shared/constants/trip.ts}（TRIP_NAME_MAX_LENGTH / TRIP_MEMO_MAX_LENGTH）
 * と値を一致させること。
 */
public final class TripConstraints {

    public static final int NAME_MAX_LENGTH = 100;
    public static final int MEMO_MAX_LENGTH = 2000;

    private TripConstraints() {
    }
}
