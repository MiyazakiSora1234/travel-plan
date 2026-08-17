package com.travelplan.trip.controller;

import com.travelplan.trip.dto.request.CreateTripRequest;
import com.travelplan.trip.dto.request.UpdateTripRequest;
import com.travelplan.trip.dto.response.TripResponse;
import com.travelplan.trip.service.TripService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 旅行計画に関するHTTPの入出力のみを担当する。業務ロジックは持たない。
 */
@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripResponse response = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getTrips() {
        List<TripResponse> response = tripService.getTrips();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long id) {
        TripResponse response = tripService.getTrip(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable Long id, @Valid @RequestBody UpdateTripRequest request) {
        TripResponse response = tripService.updateTrip(id, request);
        return ResponseEntity.ok(response);
    }
}
