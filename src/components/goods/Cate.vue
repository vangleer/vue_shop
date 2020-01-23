<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格分类列表 -->
      <tree-table :data="cateList" :columns="columns" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:green"></i>
          <i v-if="scope.row.cat_delete === false" style="color:red" class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="warning" size="mini">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" @click="getCateById(scope.row.cat_id)" type="primary" icon="el-icon-edit">
            编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCateItemById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" @close="editDialogClose" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editFormRef" :rules="editFormRules" :model="editCateItem" label-width="70px">
        <el-form-item label="分类名" prop="username">
          <el-input v-model="editCateItem.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateItemIndeed">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类的对线框 -->

    <el-dialog title="修改用户" @close="addCateDialogClose" :visible.sync="addCateDialogVisible" width="50%">
      <el-form ref="addCateFormRef" :rules="addCateFormRules" :model="addCateForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      //   查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      //   为table指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      //   控制添加商品分类的对话框
      addCateDialogVisible: false,
      //   添加表单规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '分类名称的长度在3到10个字符',
            trigger: 'blur'
          }
        ]
      },
      //   添加表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      //   父级分类
      parentCateList: [],

      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      //   保存当前的商品分类
      editCateItem: {},
      //   修改商品分类规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '分类名称的长度在3到10个字符',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   监听pagesize的改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        // eslint-disable-next-line standard/computed-property-even-spacing
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return ''
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 监听添加对话框关闭事件
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类框
    showAddCateDialog() {
      this.getParenCateList()
      this.addCateDialogVisible = true
    },
    // 添加
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败')
        }
        this.$message.success('添加成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //   获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    async getParenCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 根据id查询商品分类
    async getCateById(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      this.editCateItem = res.data
      this.editDialogVisible = true
    },
    // 监听修改分类框关闭
    editDialogClose() {
      this.editCateItem = {}
    },
    // 修改
    editCateItemIndeed() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateItem.cat_id, {
          cat_name: this.editCateItem.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品分类失败')
        }
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    // 根据id删除分类
    async deleteCateItemById(id) {
      const comfirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',

        type: 'warning'
      }).catch(err => err)
      if (comfirmRes !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除成功')
      this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped></style>
