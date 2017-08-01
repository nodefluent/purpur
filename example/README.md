# Quick Start Example

1. start the env-setup (if you dont have kafka, mysql and redis running locally) `../env-setup/start.sh`
2. create a database on your local mysql via `../env-setup/mysql.sh` execute `CREATE DATABASE purpur;`
3. start purpur `npm start`
4. create a job/process that will consume kafka messages and write them to a ./test-db.sqlite database in this folder with `node create.js`
5. produce a message to the kafka topic that the process (you just created) is listening on with `node produce.js`
6. open the the sqlite database e.g. `sqlitebrowser test-db.sqlite` and check the accounts table, it should contain a row, created from your kafka message 
7. checkout the api, turn your browser to `http://localhost:4203/api/v2/operations`
8. find connector/kafka stats at `http://localhost:4203/api/v1/operations/name/example:1/stats`
9. find connector metrics at `http://localhost:4203/api/v1/operations/name/example:1/metrics`
10. remove the job/process via `node delete.js`
11. halt the services via `../env-setup/stop.sh`
