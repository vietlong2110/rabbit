var z-score = function(population) {
	var sum = 0;
	for (i = 1; i < population.length; i++)
		sum += population[i];
	var avg = sum / (population.length - 1);
	var tmp = 0;
	for (i = 1; i < population.length; i++)
		tmp += (population[i] - avg) * (population[i] - avg);
	var std = Math.sqrt(tmp / (population.length - 1));
	return (population[0] - avg) / std;
};
module.exports.z-score = z-score;