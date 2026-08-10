package com.travelplan.trip.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.travelplan.trip.entity.Trip;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * EntityのHibernateアノテーション（@CreationTimestamp / @UpdateTimestamp）の挙動を検証する。
 * CHECK制約等のDB固有スキーマはFlyway migrationの責務であり、JPA層のテストとは分離するため、
 * ここではFlywayを無効化しHibernateにテスト用スキーマを生成させる（本番スキーマとは無関係）。
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class TripRepositoryTest {

    @Autowired
    private TripRepository tripRepository;

    @Test
    void 登録時にcreatedAtとupdatedAtが設定される() {
        Trip trip = new Trip("旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null);

        Trip saved = tripRepository.saveAndFlush(trip);

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void 更新するとupdatedAtがcreatedAtより新しくなる() throws InterruptedException {
        Trip trip = new Trip("旅行", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), null);
        Trip saved = tripRepository.saveAndFlush(trip);
        OffsetDateTime createdAt = saved.getCreatedAt();
        OffsetDateTime firstUpdatedAt = saved.getUpdatedAt();

        // クロックの解像度によっては同一ミリ秒で完了し得るため、明確に差が出るよう間隔を空ける。
        Thread.sleep(5);

        // EntityはSetterを持たないため、Hibernateの管理下にあるインスタンスをリフレクションで変更する。
        // dirty checkingはフィールドの実値を見るため、Setter経由か否かに関わらず正しく検知される。
        ReflectionTestUtils.setField(saved, "memo", "更新後のメモ");
        Trip updated = tripRepository.saveAndFlush(saved);

        assertThat(updated.getCreatedAt()).isEqualTo(createdAt);
        assertThat(updated.getUpdatedAt()).isAfter(firstUpdatedAt);
    }
}
