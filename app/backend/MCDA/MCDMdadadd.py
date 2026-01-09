from mcda.matrices import *
from mcda.relations import *
from mcda.scales import *
from mcda.outranking.electre import *
alternatives = ["Peugeot 505 GR",
    "Opel Record 2000 LS",
    "Citroen Visa Super E",
    "VW Golf 1300 GLS",
    "Citroen CX 2400 Pallas"]
scales = {
    0: QuantitativeScale(2, 8, preference_direction=MIN),
    1: QuantitativeScale(2, 7, preference_direction=MAX),
    2: QuantitativeScale(3, 7, preference_direction=MAX),
}
dataset = PerformanceTable(
    [
        [2, 3, 5],   # Alternative 1
        [8, 7, 7],  # Alternative 2
        [3, 2, 5],  # Alternative 3
        [5, 5, 6],  # Alternative 4
        [2, 4, 3]   # Alternative 5
    ],
    alternatives=alternatives,
    scales=scales
)
W = {
    0: 2, 1: 3, 2: 1}
c_hat = 0.4
d_hat = {0: 0.65, 1: 0.65, 2: 0.65}
electre1 = Electre1(dataset, W, c_hat, d_hat)
concordance_mat = electre1.concordance()
discordance_mat = electre1.discordance()
print(concordance_mat.data)
s=discordance_mat.data
outranking_matrix = electre1.outranking(concordance_mat, discordance_mat)
print(outranking_matrix.data)
# print(discordance_mat.data)
print(PreferenceStructure.from_outranking_matrix(outranking_matrix).outranking_matrix.data)
outranking_matrix = electre1.construct()
# print(outranking_matrix.data)
# print(electre1.exploit(outranking_matrix))
# print(electre1.exploit(outranking_matrix, cycle_reduction=True))
# print(electre1.exploit(
#     outranking_matrix, cycle_reduction=True, transitivity=True
# ))
print(electre1.select(cycle_reduction = True,transitivity= True)
)