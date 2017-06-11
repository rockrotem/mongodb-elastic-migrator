# mongodb-elastic-migrator

Migrate mongodb collection to elastic a.k.a elasticsearch

# Prerequisite
 - Install docker and get elastic docker image. The Docker image can be retrieved with the following command:
    ```
    docker pull docker.elastic.co/elasticsearch/elasticsearch:5.4.1
    ```
 - Elasticsearch can be quickly started for development or testing use with the following command:
   ```
   docker run -p 9200:9200 -e "http.host=0.0.0.0" -e "transport.host=127.0.0.1" docker.elastic.co/elasticsearch/elasticsearch:5.4.1
   ```
   
   For user and password and more information read elastic web site:
   https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
 
 - Get mongodb docker image or install it locally on your machine. The Docker image can be retrieved with the following command:
   ```
   docker pull mongo
   ```
   read more:
   https://hub.docker.com/_/mongo/
   
# Usage
  1. git@github.com:rockrotem/mongodb-elastic-migrator.git
  2. cd mongodb-elastic-migrator
  3. edit your configuration file locate: config/index.js
     Example:
  ```
    module.exports = {
    	mongo: {
    		connection: 'mongodb://localhost:27017/my-mongo-db'
    	},
    
    	elastic: {
    		host: 'http://localhost:9200',
            httpAuth:'elastic:changeme',
            log: [{
                type: 'stdio',
                levels: ['error', 'warning', 'info']
            }]
    	},
    
    	collections: [ {
    		name: 'articles',
    		index: 'articles',
    		type: 'article',
    		fields: ['_id', 'title', 'name', 'seo', 'createdDate', 'updatedDate'],
    		mapping: {
            			// Elastic Seach mapping
            		}
    	},{
            name: 'authors',
            index: 'authors',
            type: 'author',
            fields: ['_id', 'first_name', 'last_name', 'email', 'title', 'bio']
        }]
    };
  ```
  
  NOTE: Mapping is optional field, not a must when Elastic default mapping is used.
  
  4. node bin/migrate
  
  example output:
  ![Alt text](screen-shot.png?raw=true "migrate output")
  
