package io.airbyte.integrations.debezium.internals;

import static io.airbyte.db.DataTypeUtils.TIMESTAMPTZ_FORMATTER;
import static io.airbyte.db.DataTypeUtils.TIMESTAMP_FORMATTER;
import static io.airbyte.db.DataTypeUtils.TIMETZ_FORMATTER;
import static io.airbyte.db.DataTypeUtils.TIME_FORMATTER;
import static java.time.temporal.ChronoField.HOUR_OF_DAY;
import static java.time.temporal.ChronoField.MINUTE_OF_HOUR;
import static java.time.temporal.ChronoField.NANO_OF_SECOND;
import static java.time.temporal.ChronoField.SECOND_OF_MINUTE;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.OffsetTime;
import java.time.ZoneId;
import java.time.chrono.IsoEra;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;

public class DateTimeConverter {

  public static final DateTimeFormatter TIME_WITH_TIMEZONE_FORMATTER = new DateTimeFormatterBuilder()
      .parseCaseInsensitive()
      .append(new DateTimeFormatterBuilder()
          .appendValue(HOUR_OF_DAY, 2)
          .appendLiteral(':')
          .appendValue(MINUTE_OF_HOUR, 2)
          .optionalStart()
          .appendLiteral(':')
          .appendValue(SECOND_OF_MINUTE, 2)
          .optionalStart()
          .appendFraction(NANO_OF_SECOND, 0, 9, true).toFormatter()).appendOffset("+HH", "0")
      .toFormatter();


  public static String convertToTimeWithTimezone(String time) {
    OffsetTime timetz = OffsetTime.parse(time, TIME_WITH_TIMEZONE_FORMATTER);
    return timetz.format(TIMETZ_FORMATTER);
  }

  public static String convertToTimestampWithTimezone(Timestamp timestamp) {
    OffsetDateTime timestamptz = OffsetDateTime.ofInstant(timestamp.toInstant(), ZoneId.of("UTC"));
    LocalDate localDate = timestamptz.toLocalDate();
    return resolveEra(localDate, timestamptz.format(TIMESTAMPTZ_FORMATTER));
  }

  public static String convertToTimestamp(Timestamp timestamp) {
    final LocalDateTime localDateTime = LocalDateTime.ofInstant(timestamp.toInstant(),
        ZoneId.of("UTC"));
    final LocalDate date = localDateTime.toLocalDate();
    return resolveEra(date, localDateTime.format(TIMESTAMP_FORMATTER));
  }

  public static String resolveEra(LocalDate date, String value) {
    return isBCE(date) ? value.substring(1) + " BC" : value;
  }

  public static boolean isBCE(LocalDate date) {
    return date.getEra().equals(IsoEra.BCE);
  }

  public static Object convertToDate(Date date) {
    LocalDate localDate = date.toLocalDate();

    return resolveEra(localDate, localDate.toString());
  }

  public static String convertToTime(String time) {
    LocalTime localTime = LocalTime.parse(time);
    return localTime.format(TIME_FORMATTER);
  }
}
