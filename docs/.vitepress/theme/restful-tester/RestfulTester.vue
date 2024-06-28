<template>
  <div class="request-response-layout">
    <div class="column">
      <h3>Request</h3>
      <select v-model="selectedExample" @change="updateRequestExample">
        <option v-for="example in examples" :key="example.name" :value="example">
          {{ example.name }}
        </option>
      </select>
      <pre>{{ endpoint }}</pre>
      <button @click="sendRequest" class="send-button">Send Request</button>
    </div>
    <div class="column">
      <h3>Response</h3>
      <pre>{{ response }}</pre>
      <button @click="saveResponse" class="save-button">Save Response</button>
    </div>
  </div>
</template>

<script setup>
  import axios from "axios";
  import { ref, watch } from "vue";

  const props = defineProps({
    endpoint: String,
    version: String,
  });

  const response = ref("");
  const requestExample = ref("");
  const selectedExample = ref(null);
  // const collectedExamples = inject("collectedExamples");

  const examples = ref([]);

  const sendRequest = async () => {
    let requestData;
    try {
      requestData = JSON.parse(requestExample.value);
    } catch (e) {
      response.value = "Invalid JSON request example";
      return;
    }

    try {
      const res = await axios({
        method: requestData.method || "GET",
        url: requestData.url,
        headers: requestData.headers || {},
        data: requestData.body || {},
      });
      response.value = JSON.stringify(res.data, null, 2);
    } catch (error) {
      response.value = "Error: " + (error.response ? error.response.data : error.message);
    }
  };

  const saveResponse = () => {
    fs.writeFileSync("response.json", response.value);
    // const savedResponses = JSON.parse(localStorage.getItem("savedResponses") || "[]");
    // savedResponses.push({ example: selectedExample.value.name, response: response.value });
    // localStorage.setItem("savedResponses", JSON.stringify(savedResponses));
    alert("Response saved successfully");
  };

  const updateRequestExample = () => {
    if (selectedExample.value) {
      requestExample.value = JSON.stringify(
        {
          url: selectedExample.value.request.url,
          method: selectedExample.value.request.method,
          headers: selectedExample.value.request.headers,
          body: selectedExample.value.request.body,
        },
        null,
        2
      );
    }
  };

  watch(
    [() => props.endpoint, () => props.version],
    () => {
      if (props.endpoint && props.version) {
        const endpointExamples = collectedExamples.find(
          (e) =>
            e.version === props.version &&
            e.examples.some((ex) => ex.request.url === props.endpoint)
        );
        if (endpointExamples) {
          examples.value = endpointExamples.examples.filter(
            (ex) => ex.request.url === props.endpoint
          );
          selectedExample.value = examples.value[0];
          updateRequestExample();
        }
      }
    },
    { immediate: true }
  );
</script>

<style>
  .request-response-layout {
    display: flex;
    gap: 16px;
  }

  .column {
    flex: 1;
    padding: 10px;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .send-button,
  .save-button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .send-button:hover,
  .save-button:hover {
    background-color: #0056b3;
  }
</style>
