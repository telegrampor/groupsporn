import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://erogram.pro"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64 ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_soup(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_telegram_link(detail_url):
    soup = get_soup(detail_url)
    if not soup: return None
    tg_link = soup.find('a', href=lambda h: h and 't.me' in h)
    if tg_link: return tg_link['href']
    return None

def scrape_category(path, item_type, limit=20):
    print(f"Scraping {item_type} from {path}...")
    url = f"{BASE_URL}{path}"
    soup = get_soup(url)
    if not soup: return []

    items = []
    # No BeautifulSoup usamos find_all para pegar os títulos
    cards = soup.find_all('h3')
    
    for h3 in cards[:limit]:
        # CORREÇÃO: Em Python usamos .find_parent() em vez de .closest()
        card_container = h3.find_parent('div')
        link_tag = h3.find_parent('a') or (card_container.find('a') if card_container else None)
        
        if not link_tag: continue
        
        title = h3.get_text(strip=True)
        detail_path = link_tag.get('href', '')
        detail_url = f"{BASE_URL}{detail_path}" if detail_path.startswith('/') else detail_path
        
        print(f"  Processing: {title}")
        
        item = {
            "name": title,
            "slug": detail_path.strip('/'),
            "description": card_container.find('p').get_text(strip=True) if card_container and card_container.find('p') else "",
            "category": card_container.find('span', class_='uppercase').get_text(strip=True) if card_container and card_container.find('span', class_='uppercase') else "General",
            "image_url": card_container.find('img').get('src', '') if card_container and card_container.find('img') else "",
            "type": item_type,
            "status": "active"
        }
        
        if item_type in ['group', 'bot'] and detail_url.startswith(BASE_URL):
            item['telegram_url'] = extract_telegram_link(detail_url)
            time.sleep(0.5)
        else:
            item['telegram_url'] = detail_url
            
        items.append(item)
    
    return items

if __name__ == "__main__":
    all_data = []
    all_data.extend(scrape_category("/groups", "group", 20))
    all_data.extend(scrape_category("/bots", "bot", 20))
    all_data.extend(scrape_category("/ainsfw", "ai_tool", 20))
    
    with open('erogram_seed_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    
    print(f"Finished! Total items: {len(all_data)}")
