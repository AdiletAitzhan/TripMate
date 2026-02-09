# ---------- BUILD ----------
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

# копируем ВЕСЬ multi-module проект
COPY . .

# собираем только eureka-server + parent
RUN mvn -pl eureka-server -am clean package -DskipTests

# ---------- RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /build/eureka-server/target/*.jar app.jar

EXPOSE 8761
ENTRYPOINT ["java","-jar","app.jar"]
