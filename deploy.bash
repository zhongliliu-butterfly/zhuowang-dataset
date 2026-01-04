docker build --platform=linux/amd64 -f Dockerfile -t zhuowang-dataset:v1 .
docker run -d -p 1717:1717 -v ./local-db:/app/local-db -v ./prisma:/app/prisma --name zhuowang-dataset:v1 zhuowang-dataset:v1