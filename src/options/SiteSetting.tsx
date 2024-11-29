export const SiteSetting = () => {
  return (
    <div class="site-setting bg-[#f8f8f8] rounded-xl p-2 space-y-2 text-sm">


      <CheckBox title="允许在此网站运行" />
      <CheckBox title="始终翻译此站点" />

      <div class="flex justify-between">
        <span>mozilla.com</span>

        <a href="#" class="group">
          <div class="flex items-center space-x-2">
            <span class="text-gray-700 ">管理黑名单</span>
            <svg
              class="remixicon transition-colors group-hover:fill-orange-500"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path
                d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"
              ></path>
            </svg>
          </div>
        </a>

      </div>

    </div>
  )
}

const CheckBox = (props: { title: string }) => {
  return (
    <div>
      <div class="flex justify-between">
        <span>{props.title}</span>

        <div class="flex items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-orange-100 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-400 rounded-full peer peer-checked:bg-orange-500 peer-checked:after:translate-x-4 peer-checked:after:bg-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-5 after:transition-all"></div>
          </label>
        </div>

      </div>
    </div>
  )
}