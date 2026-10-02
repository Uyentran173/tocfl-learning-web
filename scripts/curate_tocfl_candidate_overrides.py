"""Apply editorial corrections to draft examples before Vietnamese translation.

The source TOCFL dataset remains untouched. This script is deliberately small:
its keyed corrections cover ambiguous parts of speech and unsuitable corpus lines.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = ROOT.parent / 'tocfl-band-work' / 'band-a-candidates.json'
OVERRIDES = ROOT / 'data/vocabulary/tocfl-candidate-overrides.json'
SOURCE = ROOT / 'data/vocabulary/tocfl-imported.json'

# (level, headword): (English sense, one Traditional Chinese example)
CORRECTIONS = {
    ('level_1', '句'): ('sentence; classifier for sentences', '這句話很有意思。'),
    ('level_1', '行'): ('line; row, classifier', '請看第三行。'),
    ('level_1', '家具'): ('furniture', '這家店賣家具。'),
    ('level_1', '台'): ('classifier for machines', '我家有兩台電腦。'),
    ('level_1', '條'): ('classifier for long narrow things', '我買了兩條魚。'),
    ('level_1', '要是'): ('if', '要是下雨，我們就待在家裡。'),
    ('level_1', '有的'): ('some', '有的學生喜歡畫畫。'),
    ('level_2', '帥'): ('handsome', '他穿這件衣服很帥。'),
    ('level_2', '題'): ('classifier for questions', '今天的作業有五題。'),
    ('level_2', '國小'): ('elementary school', '我的弟弟在國小讀書。'),
    ('level_2', '尺'): ('ruler', '這把尺放在桌上。'),
    ('level_2', '層'): ('floor; layer, classifier', '我住在大樓的第三層。'),
    ('level_2', '朵'): ('classifier for flowers', '桌上有一朵花。'),
    ('level_2', '汙染'): ('to pollute', '工廠的廢水汙染了河流。'),
    ('level_2', '美術'): ('fine arts; art class', '她喜歡上美術課。'),
    ('level_2', '封'): ('classifier for letters', '我收到一封信。'),
    ('level_2', '除夕'): ('Lunar New Year’s Eve', '除夕晚上，我們全家一起吃飯。'),
    ('level_2', '月台'): ('train platform', '火車快來了，請到月台等候。'),
    ('level_2', '背包'): ('backpack', '我的背包放在椅子上。'),
    ('level_2', '訂位'): ('to reserve a seat', '我先打電話訂位。'),
    ('level_2', '烏龍茶'): ('oolong tea', '我喜歡喝烏龍茶。'),
    ('level_2', '口'): ('sip; mouthful, classifier', '她喝了一口水。'),
    ('level_2', '罐'): ('can; tin, classifier', '我買了一罐果汁。'),
    ('level_2', '步'): ('step; pace, classifier', '他向前走了一步。'),
    ('level_1', '市'): ('city; market', '他住在台北市。'),
    ('level_1', '名'): ('classifier for people', '會議有十名學生參加。'),
    ('level_1', '禮拜'): ('week', '寒冷的天氣持續了三個禮拜。'),
    ('level_1', '更'): ('even more; still more', '今天比昨天更冷。'),
    ('level_1', '雙'): ('pair; classifier for pairs', '我買了一雙新鞋。'),
    ('level_1', '道'): ('classifier for dishes, questions or lines', '桌上有一道新菜。'),
    ('level_1', '包'): ('packet; bag, classifier', '我買了一包餅乾。'),
    ('level_2', '鐘'): ('o’clock, used after a number', '我們三點鐘見面。'),
    ('level_2', '遍'): ('once through; time, for an action from start to finish', '請再讀一遍。'),
    ('level_2', '袋'): ('bagful; classifier for bags', '他買了一袋米。'),
    ('level_2', '套'): ('set; classifier for sets', '她買了一套新衣服。'),
    ('level_2', '類'): ('kind; type', '這類問題很常見。'),
    ('level_2', '樣'): ('kind; sort', '這家店有三樣甜點。'),
    ('level_3', '包'): ('to wrap; to pack', '她把禮物包起來。'),
    ('level_3', '比'): ('to compare; to compete', '我們來比一比誰跑得快。'),
    ('level_3', '餐'): ('classifier for meals', '我一天吃三餐。'),
    ('level_3', '尺'): ('Chinese foot; unit of length', '這塊布長三尺。'),
    ('level_3', '串'): ('string; classifier for a string of things', '她買了一串葡萄。'),
    ('level_3', '段'): ('section; paragraph, classifier', '請讀下一段。'),
    ('level_3', '堆'): ('pile; heap, classifier', '院子裡有一堆沙子。'),
    ('level_3', '頓'): ('classifier for meals or scoldings', '我們一起吃了一頓飯。'),
    ('level_3', '回'): ('time; occurrence, classifier', '我去過台南兩回。'),
    ('level_3', '家'): ('classifier for businesses or families', '這條街有三家書店。'),
    ('level_3', '科'): ('classifier for subjects or courses', '他今年選了三科課程。'),
    ('level_3', '門'): ('classifier for courses or subjects', '學校開了一門新課。'),
    ('level_3', '期'): ('issue; installment, classifier', '這是第十期雜誌。'),
    ('level_3', '聲'): ('sound; time, classifier for sounds', '門外傳來一聲巨響。'),
    ('level_3', '組'): ('group; set, classifier', '老師把學生分成三組。'),
    ('level_4', '棒'): ('baton; classifier for a relay leg', '他跑完了接力賽的最後一棒。'),
    ('level_4', '處'): ('place; location, classifier', '這篇文章有三處需要修改。'),
    ('level_4', '床'): ('classifier for quilts or bedding', '媽媽買了一床新棉被。'),
    ('level_4', '頓'): ('classifier for meals or scoldings', '他們請客吃了一頓飯。'),
    ('level_4', '番'): ('time; round, classifier', '我們討論了一番才做決定。'),
    ('level_4', '付'): ('pair; set, classifier', '他戴著一付眼鏡。'),
    ('level_4', '副'): ('pair; set, classifier', '她戴了一副新眼鏡。'),
    ('level_4', '關'): ('pass; barrier, classifier', '他順利通過了第一關。'),
    ('level_4', '卷'): ('volume; roll, classifier', '這套書一共有三卷。'),
    ('level_4', '粒'): ('grain; small round object, classifier', '請服用一粒藥丸。'),
    ('level_4', '圈'): ('circle; lap, classifier', '他沿著操場跑了三圈。'),
    ('level_4', '桶'): ('bucketful; classifier', '他倒掉了一桶髒水。'),
    ('level_4', '周'): ('week; circuit', '他繞著公園走了一周。'),
    ('level_4', '週'): ('week', '一週有七天。'),
    ('level_5', '欸'): ('hey; an interjection', '欸，你等我一下。'),
    ('level_5', '愛國'): ('patriotic; to love one’s country', '愛國不等於排斥其他文化。'),
    ('level_5', '愛滋病'): ('AIDS', '他感染了愛滋病。'),
    ('level_5', '把手'): ('handle; handgrip', '門上的把手壞了。'),
    ('level_5', '幫'): ('group; band, classifier', '一幫朋友來幫忙。'),
    ('level_5', '波'): ('wave; surge, classifier', '這一波寒流持續了三天。'),
    ('level_5', '發'): ('round; shot, classifier', '他向空中開了一發子彈。'),
    ('level_5', '股'): ('strand; current, classifier', '一股冷風吹進房間。'),
    ('level_5', '欄'): ('column; section, classifier', '請在表格的第二欄填上姓名。'),
    ('level_5', '畝'): ('mu; unit of land area', '這片農地有三畝大。'),
    ('level_5', '匹'): ('classifier for horses or bolts of cloth', '農場裡有五匹馬。'),
    ('level_5', '拳'): ('punch; fistful, classifier', '他朝沙包打了三拳。'),
    ('level_5', '團'): ('ball; lump, classifier', '她把麵粉揉成一團。'),
    ('level_5', '盞'): ('classifier for lamps or lights', '房間裡亮著兩盞燈。'),
    ('level_5', '丈'): ('zhang; traditional unit of length', '這棵樹高約三丈。'),
    ('level_3', '親眼'): ('with one’s own eyes', '他親眼看見那場事故。'),
    ('level_3', '嚇一跳'): ('to get a fright; to be startled', '突然的巨響讓我嚇一跳。'),
    ('level_4', '不得已'): ('as a last resort; having no choice', '他不得已，只好取消旅行。'),
    ('level_4', '逢'): ('to meet; to come upon', '每逢過年，家人都會聚在一起。'),
    ('level_4', '考察'): ('to inspect; to study on site', '研究團隊到當地考察環境。'),
    ('level_4', '湯圓'): ('tangyuan; glutinous rice balls', '元宵節那天，我們一起吃湯圓。'),
    ('level_4', '贈品'): ('free gift; promotional item', '買這本書會附贈一份贈品。'),
    ('level_5', '不等'): ('unequal; varying', '這些商品的價格高低不等。'),
    ('level_5', '成衣'): ('ready-made clothing', '這家店出售各式成衣。'),
    ('level_5', '柳樹'): ('willow tree', '河岸邊種著一排柳樹。'),
    ('level_5', '盲從'): ('to follow blindly', '不要盲從別人的意見，要自己判斷。'),
    ('level_5', '譬如/譬如說'): ('for example; such as', '譬如說，閱讀可以幫助我們學習新知識。'),
    ('level_5', '失手'): ('to slip up; to drop something accidentally', '他失手打破了杯子。'),
    ('level_5', '師範'): ('teacher training; pedagogical', '她在師範大學學習教育。'),
    ('level_5', '搜集'): ('to collect; to gather', '他花了幾個月搜集相關資料。'),
}

def main():
    source = json.loads(SOURCE.read_text(encoding='utf-8'))['records']
    candidates = json.loads(CANDIDATES.read_text(encoding='utf-8')) if CANDIDATES.exists() else None
    overrides = json.loads(OVERRIDES.read_text(encoding='utf-8'))
    matched = set()
    for record in source:
        key = record['levelId'], record['traditional']
        if key not in CORRECTIONS:
            continue
        meaning, example = CORRECTIONS[key]
        if candidates is not None and record['id'] in candidates['entries']:
            entry = candidates['entries'][record['id']]
            entry.update(meaningEn=meaning, exampleTraditional=example)
            entry.pop('exampleSource', None)
            entry.pop('exampleEn', None)
        overrides[record['id']] = {'meaningEn': meaning, 'exampleTraditional': example}
        matched.add(key)
    if matched != set(CORRECTIONS):
        raise ValueError(f'Unmatched correction keys: {set(CORRECTIONS) - matched}')
    if candidates is not None:
        CANDIDATES.write_text(json.dumps(candidates, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    OVERRIDES.write_text(json.dumps(overrides, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Applied {len(matched)} corrections')

if __name__ == '__main__':
    main()
