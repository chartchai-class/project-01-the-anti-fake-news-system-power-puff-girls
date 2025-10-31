<script setup lang="ts">
import { ref } from 'vue'

// --- "สมอง" ของหน้า ---

// 1. ตัวสลับโหมด "แก้ไข"
const isEditing = ref(false)

// 2. ข้อมูลของนาย
const name = ref('Your name') // (ชื่อ)
const nickname = ref('Your Nickname') // (ชื่อเล่น)
const email = ref('Your@socialfact.com') // (อีเมล)

// 3. URL รูปโปรไฟล์
const profileImageUrl = ref<string | null>(null)

// 4. ฟังก์ชันตอนกด "Edit" หรือ "Save"
function handleEditClick() {
  if (isEditing.value) {
    // --- กำลังจะกด "Save" ---
    console.log('กำลังเซฟข้อมูลใหม่:')
    console.log('Name:', name.value)
    console.log('Nickname:', nickname.value)
  }
  isEditing.value = !isEditing.value
}

// 5. ฟังก์ชันตอน "เลือกรูป"
function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    profileImageUrl.value = URL.createObjectURL(file)
    console.log('กำลังอัปโหลดไฟล์:', file.name)
  }
}

// 6. "ฟังก์ชัน" สำหรับปุ่ม Logout
function handleLogout() {
  // (ปกติ... ตรงนี้เราจะลบ "ตั๋ว" (token)
  // แล้วก็ "วาร์ป" กลับไปหน้า Login น่ะ!)
  console.log('กำลัง Logout!')
  alert('บ๊ายบาย! ไว้เจอกันใหม่นะ! 👋')
}

</script>

<template>
  <div class="flex w-full justify-center">
    
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      
      <h1 class="mb-6 text-center text-3xl font-bold text-gray-800">
        Account Details
      </h1>

      <div class="mb-6 flex flex-col items-center">
        <div class="relative">
          <img 
            :src="profileImageUrl || 'https://via.placeholder.com/150/EEEEEE/999999?text=Upload'" 
            alt="Profile picture" 
            class="h-32 w-32 rounded-full object-cover shadow-inner"
          />
          <label 
            for="profileUpload" 
            class="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-md transition hover:scale-110"
            aria-label="Upload new photo"
          >
            <span class="material-symbols-outlined text-xl">edit</span>
            <input 
              id="profileUpload" 
              type="file" 
              @change="onFileChange" 
              class="hidden" 
              accept="image/png, image/jpeg" 
            />
          </label>
        </div>
      </div>

      <div class="space-y-4">
        
        <div>
          <label for="name" class="mb-2 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            v-model="name"
            :disabled="!isEditing" 
            :class="[
              'block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm transition',
              isEditing 
                ? 'bg-white text-gray-900 ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-500'
            ]"
          />
        </div>

        <div>
          <label for="nickname" class="mb-2 block text-sm font-medium text-gray-700">
            Nickname
          </label>
          <input
            type="text"
            id="nickname"
            v-model="nickname"
            :disabled="!isEditing" 
            :class="[
              'block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm transition',
              isEditing 
                ? 'bg-white text-gray-900 ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-500'
            ]"
          />
        </div>

        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            v-model="email"
            disabled 
            class="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-gray-500 shadow-sm"
          />
          <p v-if="!isEditing" class="mt-1 text-xs text-gray-400">
            (Email can't change)
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          
          <button 
            type="button" 
            @click="handleEditClick"
            class="rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:scale-105"
            :class="[
              isEditing 
                ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                : 'bg-gradient-to-r from-blue-500 to-green-400' 
            ]"
          >
            {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
          </button>

          <button 
            type="button" 
            @click="handleLogout"
            class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Logout
          </button>

        </div>
        
      </div>

    </div>
  </div>
</template>