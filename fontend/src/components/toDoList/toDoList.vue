/*
 * @Author: xypecho
 * @Date: 2018-10-17 21:20:30
 * @Last Modified by: xueyp
 * @Last Modified time: 2018-11-14 15:57:28
 */
<template>
    <div class="toDoList">
        <el-card class="box-card">
            <div slot="header" class="clearfix" >
                <input type="text" placeholder="请输入备忘录" v-model="newToDoList" @keyup.enter="addTodoList">
                <el-button style="float: right; padding: 3px 0" type="text" @click='addTodoList'>新增</el-button>
            </div>
            <div v-for="(val,key) in todoList" :key="key" class="text item">
                <input type="checkbox" name="" id="" v-model="val.checked" @click="checked(key)">
                <img v-if="val.checked" src="~@/assets/images/checked.svg" alt="" height="40">
                <img v-else src="~@/assets/images/unchecked.svg" alt="" height="40">
                <label :class="{ isComplete:val.checked }" v-show="val.editing==1?true:false" >{{ val.name }}</label>
                <el-input 
                    :class="{ isComplete:val.checked }" 
                    v-show="!val.editing==1?true:false" 
                    v-model="val.name"       
                    @keyup.enter="doneEdit(key)"
                    @keyup.esc="cancelEdit(key)"
                    @blur="doneEdit(key)">
                </el-input>
                <!-- delete-icon删除图标和修改图标class都是一样 -->
                <span class="el-icon-check delete-icon" @click='checkThisTodoList(key)'></span>
                <span class="el-icon-close delete-icon" @click='deleteThisTodoList(key)'></span>
                
            </div>
              
        </el-card>
        <!-- 
          <input
                v-show="editing"
                v-focus="editing"
                :value="val.name"
                class="edit"
                @keyup.enter="doneEdit"
                @keyup.esc="cancelEdit"
                @blur="doneEdit"
              > -->
    </div>
</template>

<script>
export default {
  data() {
    return {
      todoList: [
        { name: '', checked: '' ,editing:''},
        // { name: '将该项目成功部署到服务器', checked: true },
        // { name: '学会Node', checked: true },
        // {
        //   name: '看完《Javascript权威指南》，话说已经很久没看了。。。',
        //   checked: false
        // },
        // { name: '学linux', checked: false },
        // { name: '工资突破10k，三线小县城能达到这水平么。。。', checked: false },
        // { name: '想原地爆炸', checked: false },
        // { name: '我无敌', checked: false },

      ],
      newToDoList: '',
      editing:true
    };
  },
  mounted(){
        // 挂载时，直接初始化todoList
        this.inittodoList();
  },
  methods: {
    inittodoList() {
      // console.log("我进来了")
      this.$axios
        .get('/api/user/todoList')
        .then(res => {
          // console.log(res.data);
          this.todoList=res.data;
          console.log(this.todoList);
        })
        .catch(err => {
          console.log(err);
        });
    },

    addTodoList() {
      // console.log(this.newToDoList);
      // 增加时间节点，用于修改name时，能够根据时间不同进行判别
      let datatime = new Date().getTime();
      // datatime=new Date()
      // console.log(datatime)
      this.$axios
        .post('/api/user/addtodoList', {
          name: this.newToDoList,
          datatime:datatime,
          checked:0
        })
        .then(res => {
          // console.log("增加的res："+res.data.status)
          if(res.data.status===201){
            this.$tips({
              message: res.data.message,
              type: ''
            });
          }
          else if(res.status===202){
            this.$tips({
                message: res.data.message,
                type: ''
            });
          }
          if(res.status===200){
              this.inittodoList();
              this.$tips({
                  message: res.data.message,
                  type: ''
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
        // 重置页面
        this.newToDoList='';
    },

    deleteThisTodoList(key) {
      // console.log("key:"+key);
      this.$axios
        .post('/api/user/deletetodoList', {
          key:key,
          list:this.todoList[key]
        })
        .then(res => {      
          // console.log("res:"+res) 
          // this.todoList.splice(key, 1);  
          this.inittodoList();
          this.$tips({
                  message: res.data.message,
                  type: ''
            });
          // console.log("key:"+key);
        })
        .catch(err => {
          console.log(err);
        });
        // this.inittodoList();
    },
    checked(key){
      console.log(this.todoList[key].checked)
      this.$axios
        .post('/api/user/checked', {
          key:key,
          checked:checked,
          name:this.todoList[key].name,
          datatime:this.todoList[key].datatime
        })
        .then(res => {    
          console.log("我准备修改"+res.data)   
          // console.log(this.todoList[key]);
          this.inittodoList();
          this.$tips({
                  message: res.data.message,
                  type: ''
            });
          // console.log("key:"+key);
        })
        .catch(err => {
          console.log(err);
        });
      },
    },
    checkThisTodoList(key) {
      // console.log("key:"+key);
      // 把要编辑的内容显示为input，并把相关name直接传入到input中
      this.todoList[key].editing=0;
      // console.log(this.todoList[key].datatime)
    },
    doneEdit(key) {
      this.todoList[key].editing=1;
      // console.log(this.todoList[key].name)
      this.$axios
        .post('/api/user/checktodoList', {
          key:key,
          name:this.todoList[key].name,
          datatime:this.todoList[key].datatime
        })
        .then(res => {      
          // console.log("res:"+res) 
          // this.todoList.splice(key, 1);  
          
          console.log("我准备修改"+this.todoList[key]);
          this.inittodoList();
          this.$tips({
                  message: res.data.message,
                  type: ''
            });
          // console.log("key:"+key);
        })
        .catch(err => {
          console.log(err);
        });
        // this.inittodoList();
    },
    // deleteThisTodoList(key) {
    //   this.todoList.splice(key, 1);
    //   console.log("key:"+key)
    // }
  
 
};
</script>
<style lang='stylus' scoped>
.box-card {
    width: 100%;

    .clearfix {
        &:before, &:after {
            display: table;
            content: '';
        }

        &:after {
            clear: both;
        }

        input {
            border: none;
            outline: none;
            width: 50%;
        }
    }

    .item {
        background: #fff;
        color: #4d4d4d;
        font: 14px Helvetica Neue, Helvetica, Arial, sans-serif;
        font-weight: 300;
        margin: 0 auto;
        line-height: 50px;
        border-bottom: 1px solid #ededed;
        position: relative;
        display: flex;
        align-items: center;

        &:hover .delete-icon {
            display: block;
        }

        img {
            flex: 0 0 40px;
        }

        input {
            position: absolute;
            border: none;
            bottom: 0;
            height: auto;
            margin: auto 0;
            opacity: 0;
            text-align: center;
            top: 0;
            width: 40px;
            height: 50px;
        }

        label {
            font-size: 14px;
            flex: 1;
            padding-left: 10px;
        }

        .isComplete {
            text-decoration: line-through;
            color: #d9d9d9;
        }

        .delete-icon {
            float: right;
            font-size: 20px;
            color: #F56C6C;
            cursor: pointer;
            display: none;
            flex: 0 0 20px;
        }
    }
}
</style>
