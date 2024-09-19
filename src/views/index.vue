<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
const tableData = ref([]);

const inputValue = ref('');
const dynamicTags = ref([]);
const textarea2 = ref('');
const inputVisible = ref(false);
const InputRef = ref();

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};

const handleInputConfirm = () => {
  // 已经包含的话 弹窗提示
  if (dynamicTags.value.includes(inputValue.value)) {
    ElMessage.error('已经包含该玩家，请更换下一名！');
    return;
  }

  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = '';

  localStorage.setItem('dynamicTags', JSON.stringify(dynamicTags.value));

  const schedule = generatePairs(dynamicTags.value);
  tableData.value = schedule;
};

const handleClear = () => {
  localStorage.clear();
  dynamicTags.value = [];
  tableData.value = [];
};

const handleAllInputConfirm = () => {
  // split
  console.log(textarea2.value.split('\n'));
  textarea2.value.split('\n');

  dynamicTags.value = dynamicTags.value.concat(textarea2.value.split('\n'));

  // 将dynamicTags去重
  dynamicTags.value = [...new Set(dynamicTags.value)];

  const schedule = generatePairs(dynamicTags.value);
  tableData.value = schedule;

  localStorage.setItem('dynamicTags', JSON.stringify(dynamicTags.value));
};

onMounted(() => {
  nextTick(() => {
    let local = localStorage.getItem('dynamicTags') || '[]';
    if (local) {
      local = JSON.parse(local);

      dynamicTags.value = local;
      console.log(local);
      const schedule = generatePairs(dynamicTags.value);
      tableData.value = schedule;
    }
  });
});

const generatePairs = (player) => {
  let players = JSON.parse(JSON.stringify(player));
  const groups = [];
  const numPlayers = players.length;

  // 如果是奇数个玩家，添加一个虚拟玩家
  if (numPlayers % 2 === 1) {
    const nullIndex = players.indexOf('轮空');
    if (nullIndex === -1) {
      // 如果没有 null，且长度为奇数，添加 null 作为轮空
      players.push('轮空');
    }
  } else {
    // 如果是偶数，但包含 null，移除 null
    players = players.filter((player) => player !== null);
  }

  const numRounds = numPlayers - 1; // 总共需要 numPlayers - 1 轮
  const half = numPlayers / 2;

  for (let round = 0; round < numRounds; round++) {
    const roundPairs = [];
    for (let i = 0; i < half; i++) {
      const player1 = players[i];
      const player2 = players[numPlayers - 1 - i];
      if (player1 !== null && player2 !== null) {
        roundPairs.push([player1, player2]);
      }
    }
    groups.push({ date: `第${round + 1}天`, pairs: roundPairs });

    // 旋转数组：第一个固定，其他人顺时针轮转
    const last = players.pop();
    players.splice(1, 0, last);
  }

  return groups;
};
</script>

<template>
  <div>
    <div>
      <!-- <div style="margin: 10px 10px 10px 0">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          :disable-transitions="false"
          style="margin: 4px 4px 4px 0"
          @close="handleClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          placeholder="请输入姓名"
          size="small"
          @keyup.enter="handleInputConfirm"
          style="width: 160px"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput"> + 录入 </el-button>
      </div> -->
      <div>
        <el-input ref="InputRef" v-model="inputValue" placeholder="请输入姓名" style="width: 160px" />
        <el-button style="margin-left: 6px" type="primary" @click="handleInputConfirm">单个添加</el-button>
        <!-- 清空 -->
        <el-button style="margin-left: 6px" type="danger" @click="handleClear">清空</el-button>

        <el-tag type="danger" style="margin-left: 10px">玩家总数：{{ dynamicTags.length }}人</el-tag>
      </div>
      <div style="margin-top: 4px">
        <el-input
          v-model="textarea2"
          style="width: 340px"
          :autosize="{ minRows: 8, maxRows: 14 }"
          type="textarea"
          placeholder="请批量输入"
        />
        <el-button style="margin-left: 6px" type="primary" @click="handleAllInputConfirm">批量添加</el-button>
      </div>
      <!--  -->
      <div style="margin: 10px 0 10px 0">
        <el-tag v-for="tag in dynamicTags" style="margin: 0px 10px 0 0" :key="tag" closable @close="handleClose(tag)">
          {{ tag }}
        </el-tag>
      </div>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="date" label="天" width="180" />
        <el-table-column label="对练排班">
          <template #default="{ row }">
            <div style="display: flex; flex-wrap: wrap">
              <div v-for="(pair, index) in row.pairs" :key="index" style="margin-right: 6px; margin-top: 4px">
                <el-tag type="primary">{{ pair[0] }} - {{ pair[1] }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
