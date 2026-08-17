package com.travelplan.trip.service;

import com.travelplan.common.exception.BusinessRuleException;
import com.travelplan.common.exception.ResourceNotFoundException;
import com.travelplan.trip.dto.request.CreateTripRequest;
import com.travelplan.trip.dto.request.UpdateTripRequest;
import com.travelplan.trip.dto.response.TripResponse;
import com.travelplan.trip.entity.Trip;
import com.travelplan.trip.repository.TripRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 旅行計画に関するユースケースを実装する。
 * Entity↔DTOの変換責務もここに置き、ControllerとRepositoryを疎結合に保つ。
 */
@Service
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleException("endDate", "終了日は開始日以降の日付を指定してください");
        }

        Trip trip = new Trip(request.name(), request.startDate(), request.endDate(), request.memo());
        Trip saved = tripRepository.save(trip);
        return TripResponse.from(saved);
    }

    public List<TripResponse> getTrips() {
        return tripRepository.findAllByOrderByStartDateAsc().stream()
                .map(TripResponse::from)
                .toList();
    }

    public TripResponse getTrip(Long id) {
        Trip trip = findTripOrThrow(id);
        return TripResponse.from(trip);
    }

    @Transactional
    public TripResponse updateTrip(Long id, UpdateTripRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleException("endDate", "終了日は開始日以降の日付を指定してください");
        }

        Trip trip = findTripOrThrow(id);
        trip.update(request.name(), request.startDate(), request.endDate(), request.memo());
        // @UpdateTimestampはflush時に反映されるため、レスポンスの updatedAt を最新にするには明示的にflushする
        Trip updated = tripRepository.saveAndFlush(trip);
        return TripResponse.from(updated);
    }

    private Trip findTripOrThrow(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("旅行計画が見つかりません"));
    }
}
