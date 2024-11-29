import { For } from "solid-js"

export const MyWords = () => {
    const cards = [
        {
            "title": "生词",
            "svg": <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 20C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V16C21 18.2091 19.2091 20 17 20H7Z"></path><path d="M7 5H17V3H7V5ZM20 8V16H22V8H20ZM4 16V8H2V16H4ZM17 19H7V21H17V19ZM20 16C20 17.6569 18.6569 19 17 19V21C19.7614 21 22 18.7614 22 16H20ZM17 5C18.6569 5 20 6.34315 20 8H22C22 5.23858 19.7614 3 17 3V5ZM7 3C4.23858 3 2 5.23858 2 8H4C4 6.34315 5.34315 5 7 5V3ZM2 16C2 18.7614 4.23858 21 7 21V19C5.34315 19 4 17.6569 4 16H2Z" fill="currentColor"></path><path d="M9.1131 16C8.42262 16 8 15.6227 8 14.9997C8 14.8225 8.05952 14.5652 8.15476 14.3137L10.2738 8.72327C10.5893 7.88299 11.119 7.5 11.9702 7.5C12.869 7.5 13.3929 7.86584 13.7202 8.72327L15.8571 14.3137C15.9583 14.5824 16 14.7767 16 14.9939C16 15.5827 15.5417 16 14.9048 16C14.2738 16 13.9464 15.7256 13.756 15.0511L13.4643 14.1365H10.5238L10.2321 15.0168C10.0238 15.7142 9.69643 16 9.1131 16ZM10.9583 12.5531H12.9881L11.9821 9.37492H11.9345L10.9583 12.5531Z" fill="currentColor"></path></svg>
        },
        {
            "title": "已掌握",
            "svg": <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11.4444L12.3571 17L21.3571 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 11.4444L7.35714 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.2929 11.2929L10.5858 12L12 13.4142L12.7071 12.7071L11.2929 11.2929ZM17.2071 8.20711C17.5976 7.81658 17.5976 7.18342 17.2071 6.79289C16.8166 6.40237 16.1834 6.40237 15.7929 6.79289L17.2071 8.20711ZM12.7071 12.7071L17.2071 8.20711L15.7929 6.79289L11.2929 11.2929L12.7071 12.7071Z" fill="currentColor"></path></svg>
        },
        {
            "title": "例句库",
            "svg": <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13 4C17.4183 4 21 7.58172 21 12C21 16.4183 17.4183 20 13 20H11C9.70463 20 8.48118 19.6921 7.3988 19.1456L4.12966 19.4428C3.80826 19.472 3.54377 19.1936 3.58941 18.8741L4.0141 15.9013C3.36819 14.7472 3 13.4166 3 12C3 7.58172 6.58172 4 11 4H13Z"></path><path d="M7.3988 19.1456L7.30827 18.1497L7.59371 18.1237L7.84956 18.2529L7.3988 19.1456ZM4.12966 19.4428L4.22019 20.4387H4.22019L4.12966 19.4428ZM3.58941 18.8741L4.57936 19.0155V19.0155L3.58941 18.8741ZM4.0141 15.9013L4.88673 15.4129L5.05187 15.708L5.00405 16.0427L4.0141 15.9013ZM20 12C20 8.13401 16.866 5 13 5V3C17.9706 3 22 7.02944 22 12H20ZM13 19C16.866 19 20 15.866 20 12H22C22 16.9706 17.9706 21 13 21V19ZM11 19H13V21H11V19ZM7.84956 18.2529C8.79535 18.7305 9.86476 19 11 19V21C9.54451 21 8.167 20.6537 6.94805 20.0382L7.84956 18.2529ZM4.03912 18.4469L7.30827 18.1497L7.48934 20.1415L4.22019 20.4387L4.03912 18.4469ZM4.57936 19.0155C4.62501 18.696 4.36052 18.4176 4.03912 18.4469L4.22019 20.4387C3.25599 20.5263 2.46254 19.6911 2.59946 18.7327L4.57936 19.0155ZM5.00405 16.0427L4.57936 19.0155L2.59946 18.7327L3.02415 15.7599L5.00405 16.0427ZM4 12C4 13.2412 4.32218 14.4042 4.88673 15.4129L3.14146 16.3897C2.4142 15.0902 2 13.592 2 12H4ZM11 5C7.13401 5 4 8.13401 4 12H2C2 7.02944 6.02944 3 11 3V5ZM13 5H11V3H13V5Z" fill="currentColor"></path><path d="M9 9.5H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 14H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        }, 
        {
            "title": "PDF 翻译",
            "svg": <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 6C3 3.79086 4.79086 2 7 2H19C20.1046 2 21 2.89543 21 4V20C21 21.1046 20.1046 22 19 22H7C6.86193 22 6.72549 21.993 6.59102 21.9793C4.574 21.7745 3 20.0711 3 18V6ZM5 14.5351L5 6C5 4.89543 5.89543 4 7 4L19 4V14L7 14C6.27143 14 5.58835 14.1948 5 14.5351ZM19 20H7C5.89543 20 5 19.1046 5 18V17.998C5.00107 16.8944 5.89609 16 7 16L19 16V20Z" fill="currentColor"></path></svg>
        }
    ]


    return (
        <div class="dashboard grid grid-cols-2 gap-2 mt-2">
            <For each={cards} fallback={<div>Loading</div>}>
            {
                (item) => 
                <div class=" p-3  bg-[#f8f8f8] rounded-lg cursor-pointer">
                    <div class="icon">
                        {item.svg}
                    </div>
                    <div class="pt-2">{item.title}</div>
                </div>
            }

            </For> 
            
        </div>
    )
}