<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button @click="addRoleDialogVisible = true" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table border stripe :data="rolesList">
        <!-- 展开列 -->

        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="['vcenter', i2 === 0 ? '' : 'dbtop']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(scope.row, item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="getRoleById(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-edit" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" @click="showSetRightDialog(scope.row)" icon="el-icon-edit">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="showSetRightDialogVisible" @close="setRightDialogClose" width="50%">
      <el-tree :data="rightsList" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" :props="treeProps" ref="treeRef"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog title="修改角色" @close="editDialogClose" :visible.sync="editRoleDialogVisible" width="50%">
      <el-form ref="editRole" :rules="addRoleRules" :model="editRoleForm" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加角色" @close="addDialogClose" :visible.sync="addRoleDialogVisible" width="50%">
      <el-form ref="addRoleRef" :rules="addRoleRules" :model="roleForm" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有就饿死列表数据
      rolesList: [],
      //   关闭修改权限
      editRoleDialogVisible: false,
      //   角色对象
      editRoleForm: {},
      //   添加角色校验
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '用户名的长度在2到10个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { message: '请输入角色描述', trigger: 'blur' },
          { min: 3, message: '描述需在3个字符以上', trigger: 'blur' }
        ]
      },
      //   控制添加角色框
      addRoleDialogVisible: false,
      //   添加角色表单
      roleForm: { roleName: '', roleDesc: '' },
      // 控制分配权限对话框
      showSetRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async removeRightById(role, id) {
      const comfirmRes = await this.$confirm('此操作将永久删除该用户权限, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => err)
      if (comfirmRes !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      role.children = res.data
    },
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(right) {
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree')
      this.roleId = right.id
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      // 把获取到的权限数据保存到data中
      this.rightsList = res.data

      this.getLeafKeys(right, this.defKeys)
      this.showSetRightDialogVisible = true
    },
    // 通过递归的方式获取所有三级权限的id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭权限对话框
    setRightDialogClose() {
      this.defKeys = []
      this.showSetRightDialogVisible = false
    },
    // 角色授权
    async allRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.showSetRightDialogVisible = false
    },
    // 根据id获取角色
    async getRoleById(id) {
      this.editRoleDialogVisible = true
      //  根据id获取角色
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色失败')
      this.editRoleForm = res.data
    },
    // 修改角色提交表单
    async editRole() {
      const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
      if (res.meta.status !== 200) return this.$message.error('修改角色失败')

      this.editRoleDialogVisible = false
      this.getRolesList()
    },
    // 删除角色
    async deleteRole(id) {
      const comfirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => err)
      if (comfirmRes !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.info('删除成功')
      this.getRolesList()
    },
    // 关闭修改角色框
    editDialogClose() {
      this.editRoleDialogVisible = false
    },
    // 关闭添加角色框
    addDialogClose() {
      this.addRoleDialogVisible = false
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return this.$message.error('添加角色失败')
        const { data: res } = await this.$http.post('roles', this.roleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
