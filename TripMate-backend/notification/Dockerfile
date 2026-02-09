# ---------- BUILD ----------
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

COPY . .
RUN mvn -pl notification -am clean package -DskipTests

# ---------- RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /build/notification/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
