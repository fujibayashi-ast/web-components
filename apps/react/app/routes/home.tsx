import {
  MyButton,
  MyCard,
  MyCheckbox,
  MyDialog,
  MyInput,
  MySelect,
  MyTabs,
} from "@web-components/ui/react";
import { useEffect, useRef, useState } from "react";
import { type SaveState, saveDemo, saveLabels } from "../../../async-demo";
import { labelOf, roleOptions, tabItems } from "../../../demo-options";
import { mountThemeControl } from "../../../theme";
import FormSample from "../components/form-sample";

export default function Home() {
  const [count, setCount] = useState(0);
  const [displayName, setDisplayName] = useState("花子");
  const [updates, setUpdates] = useState(false);
  const [role, setRole] = useState("reader");
  const [disabled, setDisabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failSave, setFailSave] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saving = useRef(false);
  const saveFailure = useRef(false);

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>("#theme");
    const dispose = select ? mountThemeControl(select) : undefined;
    setReady(true);
    return dispose;
  }, []);

  async function save() {
    if (saving.current) return;
    saving.current = true;
    setLoading(true);
    setSaveState("saving");
    try {
      await saveDemo(saveFailure.current);
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    } finally {
      saving.current = false;
      setLoading(false);
    }
  }

  const handleCountChange = (event: CustomEvent<{ count: number }>) =>
    setCount(event.detail.count);

  function resetInputs() {
    setDisplayName("花子");
    setUpdates(false);
    setRole("reader");
    setDisabled(false);
  }

  return (
    <main data-ready={ready} className="demo-page">
      <header className="demo-header">
        <div>
          <h1 className="text-xl font-bold">Web Components</h1>
          <p className="demo-description">
            Lit で書いた 1 組のコンポーネントを、React・Vue・素の HTML
            から使うサンプルです。
          </p>
        </div>
        <label className="theme-control" htmlFor="theme">
          テーマ
          <select id="theme" disabled={!ready}>
            <option value="system">システム</option>
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
          </select>
        </label>
      </header>
      <section aria-labelledby="button-samples" className="demo-section">
        <h2 id="button-samples">
          ボタン <code className="demo-tag">my-button</code>
        </h2>
        <p className="demo-description">
          クリック回数を数え、count-change イベントを送ります。内側のボタンは
          Tailwind のクラスで上書きできます。
        </p>
        <div className="demo-actions">
          <MyButton name="デモ" onCountChange={handleCountChange} />
          <MyButton
            name="カスタム"
            className="w-64"
            buttonClass="w-full bg-emerald-600 hover:bg-emerald-700"
            onCountChange={handleCountChange}
          />
        </div>
        <p className="demo-status">親が受け取った回数: {count}</p>
      </section>
      <section aria-labelledby="async-action" className="demo-section">
        <h2 id="async-action">
          非同期アクション <code className="demo-tag">my-button</code>
        </h2>
        <p className="demo-description">
          保存に時間がかかる想定のローディングボタン。チェックを入れると保存が失敗します。
        </p>
        <MyButton
          label="変更を保存"
          buttonClass="w-48"
          loading={loading}
          disabled={!ready}
          onCountChange={save}
        />
        <MyCheckbox
          label="保存を失敗させる"
          checked={failSave}
          disabled={loading || !ready}
          onCheckedChange={(event) => {
            saveFailure.current = event.detail.checked;
            setFailSave(event.detail.checked);
          }}
        />
        <p data-testid="save-state" aria-live="polite" className="demo-status">
          保存: {saveLabels[saveState]}
        </p>
      </section>
      <section aria-labelledby="card-samples" className="demo-section">
        <h2 id="card-samples">
          カード <code className="demo-tag">my-card</code>
        </h2>
        <p className="demo-description">
          渡した中身を Shadow DOM のスロットに表示します。
        </p>
        <MyCard label="スロットの内容">
          <p>この段落はカードのスロットに差し込まれています。</p>
          <p>スロット内のカウント: {count}</p>
        </MyCard>
      </section>
      <section aria-labelledby="dialog-samples" className="demo-section">
        <h2 id="dialog-samples">
          ダイアログ <code className="demo-tag">my-dialog</code>
        </h2>
        <p className="demo-description">
          ページから開くモーダル。Esc キーか「完了」ボタンで閉じます。
        </p>
        <div className="demo-row">
          <p aria-live="polite" className="demo-status">
            ダイアログ: {dialogOpen ? "開いています" : "閉じています"}
          </p>
          <button
            type="button"
            disabled={!ready}
            className="demo-button"
            onClick={() => setDialogOpen(true)}
          >
            プロフィールを編集
          </button>
        </div>
        <MyDialog
          label="プロフィールを編集"
          open={dialogOpen}
          hidden={!ready}
          onOpenChange={(event) => setDialogOpen(event.detail.open)}
        >
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              プロフィール名
              <input
                className="demo-native-input"
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
              />
            </label>
            <button
              type="button"
              className="demo-button self-end"
              onClick={() => setDialogOpen(false)}
            >
              完了
            </button>
          </div>
        </MyDialog>
      </section>
      <section
        aria-labelledby="tabs-samples"
        className="demo-section demo-section-wide"
      >
        <h2 id="tabs-samples">
          タブ <code className="demo-tag">my-tabs</code>
        </h2>
        <p className="demo-description">
          パネルは value で対応づけます。履歴タブは無効です。
        </p>
        <MyTabs
          label="プロフィール表示"
          value={view}
          items={tabItems}
          onValueChange={(event) => setView(event.detail.value)}
        >
          <div slot="overview">
            <p>プロフィール: {displayName}</p>
            <p>役割: {role ? labelOf(roleOptions, role) : "なし"}</p>
          </div>
          <div slot="preferences">
            <p>通知: {updates ? "オン" : "オフ"}</p>
          </div>
          <div slot="history">
            <p>履歴はありません</p>
          </div>
        </MyTabs>
        <div className="demo-row">
          <p aria-live="polite" className="demo-status">
            表示中のタブ: {labelOf(tabItems, view)}
          </p>
          <button
            type="button"
            disabled={!ready}
            className="demo-button"
            onClick={() => setView("overview")}
          >
            表示をリセット
          </button>
        </div>
      </section>
      <section aria-labelledby="input-samples" className="demo-section">
        <h2 id="input-samples">
          入力部品 <code className="demo-tag">my-input</code>{" "}
          <code className="demo-tag">my-select</code>{" "}
          <code className="demo-tag">my-checkbox</code>
        </h2>
        <p className="demo-description">
          入力部品の組み合わせ。状態はページ側で持ち、変更イベントを受け取ります。
        </p>
        <MyInput
          label="表示名"
          value={displayName}
          placeholder="名前を入力"
          disabled={disabled || !ready}
          onValueChange={(event) => setDisplayName(event.detail.value)}
        />
        <MySelect
          label="役割"
          value={role}
          options={roleOptions}
          disabled={disabled || !ready}
          onValueChange={(event) => setRole(event.detail.value)}
        />
        <p aria-live="polite" className="demo-status">
          選択中の役割: {role ? labelOf(roleOptions, role) : "なし"}
        </p>
        <MyCheckbox
          label="更新を受け取る"
          checked={updates}
          disabled={disabled || !ready}
          onCheckedChange={(event) => setUpdates(event.detail.checked)}
        />
        <p role="status" className="demo-status">
          名前: {displayName} / 通知: {updates ? "オン" : "オフ"}
        </p>
        <div className="demo-row">
          <MyCheckbox
            label="入力を無効にする"
            checked={disabled}
            disabled={!ready}
            onCheckedChange={(event) => setDisabled(event.detail.checked)}
          />
          <button
            type="button"
            disabled={!ready}
            className="demo-button"
            onClick={resetInputs}
          >
            入力をリセット
          </button>
        </div>
      </section>
      <FormSample ready={ready} />
    </main>
  );
}
