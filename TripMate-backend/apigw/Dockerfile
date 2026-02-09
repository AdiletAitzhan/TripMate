# ---------- BUILD ----------
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

COPY . .
RUN mvn -pl apigw -am clean package -DskipTests

# ---------- RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /build/apigw/target/*.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java","-jar","app.jar"]
