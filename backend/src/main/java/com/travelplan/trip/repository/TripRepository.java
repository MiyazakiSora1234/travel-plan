package com.travelplan.trip.repository;

import com.travelplan.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// tripsテーブルへのDBアクセスのみを担う
@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
}
