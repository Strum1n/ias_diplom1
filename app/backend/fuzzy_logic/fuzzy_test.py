import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

load = ctrl.Antecedent(np.arange(0, 101, 1), "load")
temperature = ctrl.Antecedent(np.arange(0, 101, 1), "temperature")
vibration = ctrl.Antecedent(np.arange(0, 101, 1), "vibration")

risk = ctrl.Consequent(np.arange(0, 101, 1), "risk")

for var in [load, temperature, vibration]:
    var["low"] = fuzz.trimf(var.universe, [0, 0, 40])
    var["medium"] = fuzz.trimf(var.universe, [30, 50, 70])
    var["high"] = fuzz.trimf(var.universe, [60, 100, 100])

risk["low"] = fuzz.trimf(risk.universe, [0, 0, 40])
risk["medium"] = fuzz.trimf(risk.universe, [30, 50, 70])
risk["high"] = fuzz.trimf(risk.universe, [60, 100, 100])

rule1 = ctrl.Rule(load["high"] & temperature["high"], risk["high"])

rule2 = ctrl.Rule(vibration["high"], risk["high"])

rule3 = ctrl.Rule(load["medium"] & temperature["medium"] & vibration["medium"], risk["medium"])

rule4 = ctrl.Rule(load["low"] & temperature["low"], risk["low"])

rule5 = ctrl.Rule(vibration["low"] & temperature["low"], risk["low"])

risk_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5])
risk_sim = ctrl.ControlSystemSimulation(risk_ctrl)


risk_sim.input["load"] = 1
risk_sim.input["temperature"] = 1
risk_sim.input["vibration"] = 1

risk_sim.compute()


def get_category(var, value):
    memberships = {}
    for term_name, mf in var.terms.items():
        memberships[term_name] = fuzz.interp_membership(var.universe, mf.mf, value)
    return max(memberships, key=memberships.get), memberships


risk_value = risk_sim.output["risk"]

category, all_memberships = get_category(risk, risk_value)

category_interp = max(risk.terms, key=lambda t: fuzz.interp_membership(risk.universe, risk[t].mf, risk_value))

print("Численное значение:", risk_value)
print("Категория:", category)
print("Категория:", category_interp)
print("Принадлежности:", all_memberships)


print(risk_sim.output["risk"])
