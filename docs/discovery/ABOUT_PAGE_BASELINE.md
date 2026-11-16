# /about — обязательный landing: задание и source baseline

Дата: **05.11.2026**. **Confirmed прямым указанием владельца:** впоследствии
реализовать /about по указанному Tilda-макету **вместе с анимацией и логикой
лендинга**. Страница включена в обязательный scope этапа 4, отдельный спринт A1
после Q3; [план](../SPRINT_PLAN.md), [дизайн-код](../design/DESIGN_SYSTEM.md).

## Provenance и граница знания

| Поле | Значение / статус |
|---|---|
| Требуемый Next.js URL | /about — Confirmed |
| Tilda project | 1212341 — указан владельцем, совпадает с историческим HTML |
| Tilda page | 71867465 — указан владельцем, присутствует в историческом HTML |
| Editor source | [Tilda /about](https://tilda.ru/page/?pageid=71867465&projectid=1212341) |
| Актуальный состав / animation / интерактив | Подлежит свежему read-only MCP/browser анализу |
| Published version / индексация | MCP 06.11: `published` set; `nosearch=on`, `meta_nofollow=on` — Next index Open |
| Локали / EN peer | Open; маршрут /about обязателен, новые peers не угадывать |
| Animation flag | MCP: `animationoff` empty (source animations on) |
| Records | MCP: `recordscount` 37 |
| Старый public snapshot | _raw/page__about.html, 31.10.2026; соответствие свежему editor не проверено |

В историческом HTML наблюдаются appear/SBS-маркеры, NOLIM/GSAP-вставки
NLM003/012/091/097/111/129/142/160. Они содержат код магнитных controls,
градиентов, drag/sticky/text effects; **использование конкретным элементом и
runtime-поведение требуют проверки**. Экспорт включает общие header/footer:
нельзя приписывать все найденные вставки контенту /about автоматически.

Codex в этом дополнении исходники через Tilda MCP не получал: соответствующий
tool отсутствует, web-инструмент editor URL не открыл. Это задание на перенос
с историческими наблюдениями, не отчёт о свежей визуальной проверке анимации.
Старый robots Disallow не отменяет новый Confirmed scope и не равен noindex;
indexing/public release решаются отдельно.

## A1 — статус 06.11.2026

**Code Done:** `/about` в Next (RU-only), content + motion по MCP/HTML.
Manifest: [ABOUT_SECTION_MANIFEST.md](ABOUT_SECTION_MANIFEST.md).
Owner visual acceptance и fine-tune Open.

Выполнено:

1. MCP read-only: page/records/Zero Blocks (не меняли Tilda).
2. Section/animation карта в SECTION_MANIFEST; leftover 1144141171 исключён.
3. Landing: hero scroll-linked, intro SBS, history tabs, team hover scale,
   VK video, appear-секции, CTAs на /agent /tours /map /blog…
4. NLM129 sticky stack (`#rec1144141191`) — CSS sticky overlay; magnet/preloader/
   glitch/drag adaptations remain documented.
5. Metadata robots noindex/nofollow по source nosearch/nofollow.

## Animation/interaction карта

Для каждого элемента/эффекта сохранить, **если присутствует в source**:

- record/element ID, секцию, trigger (load/in-view/scroll/time/click/hover),
  начальное/конечное состояние, transform origin/z-index и связь с layout;
- timeline/шаги, delay/duration/easing, offsets/start/end thresholds, loop,
  replay/reset/reverse и поведение при возврате назад по странице;
- scroll-linked/SBS/parallax/sticky/pin и зависимости от viewport — по наличию,
  без вымышленных обязательных эффектов;
- desktop/mobile/touch и inherited breakpoint overrides;
- anchors/CTA, sliders, tabs, overlays, video и forms — по наличию;
  реальное назначение, focus/history/close/error/loading состояния;
- source setting → Next component/recipe → browser evidence.

Не исполнять непроверенные inserts и не переносить Tilda/NOLIM runtime целиком.
Воспроизвести их результат и взаимодействия на управляемом frontend. Если
source effect расходится с native scroll/a11y, документировать совместимую
адаптацию; не терять визуальную идею и бизнес-сценарий молча.

## Критерии приёмки A1

- /about реализован; раздел нельзя исключить или оставить external/archive
  вместо реализации без нового изменения scope владельцем.
- Основной режим сохраняет подтверждённые source animations, timing/trigger/
  sequence и логику переходов; проверка включает движение/взаимодействия,
  не только статичные screenshots. Расхождения перечислены явно.
- Responsive композиции, anchors, media и controls работают на 320/390/768,
  1440×900 и коротком окне; zoom/keyboard/touch, native document scroll.
- Reduced-motion — осмысленная статичная/упрощённая альтернатива; content
  доступен до hydration/без JS, video/error/font fallbacks устойчивы. Автодвижение
  управляемо, focus не скрывается и scroll не захватывается принудительно.
- Действия/forms ведут по подтверждённым путям; нет ложного success, потери
  данных и выдуманных backend-интеграций. Deep links/Back/Forward проверены.
- Metadata/robots/locale peers отражают установленный source/publication
  contract. EN и будущие языки не публикуются автоматически.
- Свежие lint/typecheck/build/browser evidence и отдельная приёмка владельцем.
  Production publication/DNS/commit/push остаются отдельными действиями.
