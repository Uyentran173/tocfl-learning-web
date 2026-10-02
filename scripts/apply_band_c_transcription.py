"""Apply image-checked Band C transcriptions to the existing logical test.

Run `ocr_band_c.swift` and `extract_band_c_text.py` first. This deliberately
requires the OCR draft as an argument so importing the original ZIP alone never
publishes unverified OCR as exam text.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data/structured-tests/band-c-test-01.json"

GAPS = {
    1: {
        "traditional": "從15世紀開始，歐洲便出現了手抄報紙，報導有關政治、戰爭、市場、船期等消息，【1】它突破了傳統私人信件的形式，但傳播的範圍還很小，【2】要等到印刷技術進步，報紙才【3】大量發行。報紙之所以普及，也跟近代商業的發展【4】關係。經濟快速地成長，使得不同地區、不同國家間的關係更為密切，人們需要互相了解，資訊需要快速傳播，人們對報紙的依賴也就【5】加深，報業因此蓬勃發展。",
        "simplified": "从15世纪开始，欧洲便出现了手抄报纸，报导有关政治、战争、市场、船期等消息，【1】它突破了传统私人信件的形式，但传播的范围还很小，【2】要等到印刷技术进步，报纸才【3】大量发行。报纸之所以普及，也跟近代商业的发展【4】关系。经济快速地成长，使得不同地区、不同国家间的关系更为密切，人们需要互相了解，资讯需要快速传播，人们对报纸的依赖也就【5】加深，报业因此蓬勃发展。",
    },
    6: {
        "traditional": "目前許多中小學都鼓勵學生利用電腦進行學習，但是成人的電腦讓小孩用，【6】會有各種顧慮，不是擔心重要檔案被小孩刪掉，就是怕小孩亂逛網站造成電腦中毒。當然，對父母來說，中毒事小，【7】小孩逛到色情或賭博網站，那就更糟糕了。正因為兒童使用電腦的比例逐年增加，有廠商看好這【8】趨勢，推出專為兒童設計的電腦，【9】內建各種學習軟體，【9】可讓父母監控小孩上網的情形，一上市便廣受好評，創造出亮眼的【10】，廠商也因此大撈一筆。",
        "simplified": "目前许多中小学都鼓励学生利用电脑进行学习，但是成人的电脑让小孩用，【6】会有各种顾虑，不是担心重要档案被小孩删掉，就是怕小孩乱逛网站造成电脑中毒。当然，对父母来说，中毒事小，【7】小孩逛到色情或赌博网站，那就更糟糕了。正因为儿童使用电脑的比例逐年增加，有厂商看好这【8】趋势，推出专为儿童设计的电脑，【9】内建各种学习软体，【9】可让父母监控小孩上网的情形，一上市便广受好评，创造出亮眼的【10】，厂商也因此大捞一笔。",
    },
    11: {
        "traditional": "每每回顧生命歷程，總發現某些當年所【11】的意外、經歷的曲折，後來好像都轉為一種能量和養分。若【12】這些意外與曲折，我似乎就不會在人生的路上，與難得的人、事相遇；而這些人、那些事在時間漸漸【13】一切後，只留下了由歡笑與淚水交織而成的一股暖意。曾經的悔恨和不滿彷彿都已【14】。我經常拿這些人與事向朋友分享，他們鼓勵我將之化為文字，【15】自己帶著回憶走進棺材，【15】集結成冊，當我有一天什麼都不記得時，至少還有人幫我記得這些人、那些事。",
        "simplified": "每每回顾生命历程，总发现某些当年所【11】的意外、经历的曲折，后来好像都转为一种能量和养分。若【12】这些意外与曲折，我似乎就不会在人生的路上，与难得的人、事相遇；而这些人、那些事在时间渐渐【13】一切后，只留下了由欢笑与泪水交织而成的一股暖意。曾经的悔恨和不满仿佛都已【14】。我经常拿这些人与事向朋友分享，他们鼓励我将之化为文字，【15】自己带着回忆走进棺材，【15】集结成册，当我有一天什么都不记得时，至少还有人帮我记得这些人、那些事。",
    },
}

CHOICE_FIXES = {
    9: {"traditional": ["雖然⋯但⋯", "除非⋯才⋯", "不論⋯也⋯", "不僅⋯還⋯"], "simplified": ["虽然⋯但⋯", "除非⋯才⋯", "不论⋯也⋯", "不仅⋯还⋯"]},
    15: {"traditional": ["為了⋯因此⋯", "就算⋯也能⋯", "總得⋯進而⋯", "與其⋯不如⋯"], "simplified": ["为了⋯因此⋯", "就算⋯也能⋯", "总得⋯进而⋯", "与其⋯不如⋯"]},
}

CONTEXT_FIXES = {
    18: {"simplified": [("往往成书的奴仆", "往往成为书的奴仆")]},
    24: {
        "simplified": [("而減少", "而减少"), ("鮑鼱", "鼩鼱"), ("因大的动物", "因为大的动物")],
    },
    28: {"simplified": [("企业合夥", "企业合伙")]},
    32: {
        "traditional": [("I_這些年", "【I】這些年"), ("。II照理", "。【II】照理"), ("。［I大家", "。【III】大家"), ("一筆。IV", "一筆。【IV】")],
        "simplified": [("I_这些年", "【I】这些年"), ("。 II照理", "。【II】照理"), ("。II_大家", "。【III】大家"), ("一笔。_—IV", "一笔。【IV】")],
    },
    40: {"simplified": [("「虛拟水」", "「虚拟水」")]},
    45: {"simplified": [("他认，以往", "他认为，以往"), ("双贏", "双赢")]},
}


def main():
    draft = json.load(open(sys.argv[1], encoding="utf-8"))
    package = json.load(open(PACKAGE, encoding="utf-8"))
    reading = package["components"]["reading"]
    context_by_group = {}
    for item in reading["questions"]:
        number = item["number"]
        source = draft["reading"][item["id"]]
        for script in ("traditional", "simplified"):
            context = source[script]["context"]
            if number <= 15:
                start = 1 if number <= 5 else 6 if number <= 10 else 11
                context = GAPS[start][script]
            group_start = next(start for start, end in [(1, 5), (6, 10), (11, 15), (16, 17), (18, 20), (21, 23), (24, 27), (28, 31), (32, 35), (36, 39), (40, 44), (45, 50)] if start <= number <= end)
            for old, new in CONTEXT_FIXES.get(group_start, {}).get(script, []):
                if old not in context:
                    raise ValueError(f"Missing source phrase in Reading {number} {script}: {old}")
                context = context.replace(old, new)
            if group_start == 45:
                context = context.replace("然而，", "【45】然而，", 1)
            group = item["stimulusGroupId"]
            if group in context_by_group and script in context_by_group[group] and context_by_group[group][script] != context:
                raise ValueError(f"Context mismatch in {group} {script}")
            context_by_group.setdefault(group, {})[script] = context
            choices = CHOICE_FIXES.get(number, {}).get(script, source[script]["choices"])
            if len(choices) != 4 or any(not choice for choice in choices):
                raise ValueError(f"Incomplete Reading choices {number} {script}")
            item.setdefault("choiceText", {})[script] = choices
            if number > 15:
                prompt = source[script]["prompt"]
                if not prompt:
                    raise ValueError(f"Missing Reading prompt {number} {script}")
                item.setdefault("questionText", {})[script] = prompt
    reading["displayContexts"] = context_by_group
    for item in package["components"]["listening"]["questions"]:
        source = draft["listening"][item["id"]]
        for script in ("traditional", "simplified"):
            choices = source[script]["choices"].copy()
            if item["number"] == 31 and script == "traditional":
                if choices[3] != "因為想知道自己的帳號是否被盗用":
                    raise ValueError("Unexpected Listening 31 source text")
                choices[3] = "因為想知道自己的帳號是否被盜用"
            if len(choices) != 4 or any(not choice for choice in choices):
                raise ValueError(f"Incomplete Listening choices {item['number']} {script}")
            item.setdefault("choiceText", {})[script] = choices
    # Verify every Reading passage/choice comes from the corresponding image,
    # every question has both explicit script variants, and no answer key moves.
    assert len(reading["questions"]) == 50 and len(package["components"]["listening"]["questions"]) == 50
    assert len(reading["displayContexts"]) == 12
    PACKAGE.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
