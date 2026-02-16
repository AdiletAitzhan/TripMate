# ---------- BUILD ----------
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

COPY . .
RUN mvn -pl trip-service -am clean package -DskipTests

# ---------- RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /build/trip-service/target/*.jar app.jar

EXPOSE 8085
ENTRYPOINT ["java","-jar","app.jar"]
