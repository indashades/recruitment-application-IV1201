import { DetailedView } from "../view/DetailedView";
import { observer } from "mobx-react-lite";
import "../i18n";
import { useTranslation } from "react-i18next";

const Detailed = observer(function DetailedRender({ model }) {
  const { t } = useTranslation();

  const application = model.selectedApplication ?? model.application ?? null;

  async function handleStatusChange(e) {
    if (!application) return;

    const nextStatus = e.target.value;
    model.setsstat();

    const result = await model.changeStatus(nextStatus);

    if (result === 1) {
      alert(t("guh4"));
    } else if (result === 2) {
      alert(t("guh5"));
    }

    model.setss("unhandled", "");
    await model.onSearch();

    if (model.mes?.message) {
      alert(model.mes.message);
    }

    window.location.hash = "#/rec";
  }

  return (
    <DetailedView
      p2={handleStatusChange}
      model={model}
      application={application}
    />
  );
});

export { Detailed };