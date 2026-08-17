package com.travelplan.trip.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplan.common.exception.BusinessRuleException;
import com.travelplan.common.exception.ResourceNotFoundException;
import com.travelplan.trip.dto.request.CreateTripRequest;
import com.travelplan.trip.dto.request.UpdateTripRequest;
import com.travelplan.trip.dto.response.TripResponse;
import com.travelplan.trip.entity.Trip;
import com.travelplan.trip.repository.TripRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

// TripServiceの単体テスト（Repositoryはモック化）
@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    private TripService tripService;

    @BeforeEach
    void setUp() {
        tripService = new TripService(tripRepository);
    }

    /** EntityはSetterを持たないため、テスト用にリフレクションでDB採番相当の値を設定する。 */
    private static Trip persistedTrip(String name, LocalDate startDate, LocalDate endDate, String memo, long id) {
        Trip trip = new Trip(name, startDate, endDate, memo);
        ReflectionTestUtils.setField(trip, "id", id);
        ReflectionTestUtils.setField(trip, "createdAt", OffsetDateTime.now());
        ReflectionTestUtils.setField(trip, "updatedAt", OffsetDateTime.now());
        return trip;
    }

    @Test
    void 旅行計画を登録できる() {
        CreateTripRequest request = new CreateTripRequest(
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする");

        Trip saved = persistedTrip("東京・京都旅行", request.startDate(), request.endDate(), request.memo(), 1L);
        when(tripRepository.save(any(Trip.class))).thenReturn(saved);

        TripResponse response = tripService.createTrip(request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("東京・京都旅行");
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2026, 9, 1));
        assertThat(response.endDate()).isEqualTo(LocalDate.of(2026, 9, 5));

        ArgumentCaptor<Trip> captor = ArgumentCaptor.forClass(Trip.class);
        verify(tripRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("東京・京都旅行");
    }

    @Test
    void 終了日が開始日より前だと例外になる() {
        CreateTripRequest request = new CreateTripRequest(
                "無効な旅行",
                LocalDate.of(2026, 9, 5),
                LocalDate.of(2026, 9, 1),
                null);

        assertThatThrownBy(() -> tripService.createTrip(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("終了日");
    }

    @Test
    void 開始日と終了日が同じ日でも登録できる() {
        LocalDate sameDay = LocalDate.of(2026, 9, 1);
        CreateTripRequest request = new CreateTripRequest("日帰り旅行", sameDay, sameDay, null);

        Trip saved = persistedTrip("日帰り旅行", sameDay, sameDay, null, 2L);
        when(tripRepository.save(any(Trip.class))).thenReturn(saved);

        TripResponse response = tripService.createTrip(request);

        assertThat(response.startDate()).isEqualTo(response.endDate());
    }

    @Test
    void 旅行計画一覧を開始日昇順で取得できる() {
        Trip trip1 = persistedTrip("北海道旅行", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 5), null, 1L);
        Trip trip2 = persistedTrip("東京・京都旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "寺社巡りをする", 2L);
        when(tripRepository.findAllByOrderByStartDateAsc()).thenReturn(List.of(trip2, trip1));

        List<TripResponse> response = tripService.getTrips();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).name()).isEqualTo("東京・京都旅行");
        assertThat(response.get(1).name()).isEqualTo("北海道旅行");
    }

    @Test
    void 旅行計画が0件の場合は空のリストを返す() {
        when(tripRepository.findAllByOrderByStartDateAsc()).thenReturn(List.of());

        List<TripResponse> response = tripService.getTrips();

        assertThat(response).isEmpty();
    }

    @Test
    void IDを指定して旅行計画を取得できる() {
        Trip trip = persistedTrip("東京・京都旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null, 1L);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));

        TripResponse response = tripService.getTrip(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("東京・京都旅行");
    }

    @Test
    void 存在しないIDを取得しようとすると例外になる() {
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tripService.getTrip(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void 旅行計画を更新できる() {
        Trip trip = persistedTrip("東京・京都旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null, 1L);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(tripRepository.saveAndFlush(any(Trip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTripRequest request = new UpdateTripRequest(
                "東京・京都旅行（更新）",
                LocalDate.of(2026, 9, 2),
                LocalDate.of(2026, 9, 6),
                "ホテル予約済み");

        TripResponse response = tripService.updateTrip(1L, request);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("東京・京都旅行（更新）");
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2026, 9, 2));
        assertThat(response.endDate()).isEqualTo(LocalDate.of(2026, 9, 6));
        assertThat(response.memo()).isEqualTo("ホテル予約済み");
    }

    @Test
    void 存在しないIDを更新しようとすると例外になる() {
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateTripRequest request = new UpdateTripRequest(
                "旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null);

        assertThatThrownBy(() -> tripService.updateTrip(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void 更新時に終了日が開始日より前だと例外になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "無効な旅行", LocalDate.of(2026, 9, 5), LocalDate.of(2026, 9, 1), null);

        assertThatThrownBy(() -> tripService.updateTrip(1L, request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("終了日");
    }
}
