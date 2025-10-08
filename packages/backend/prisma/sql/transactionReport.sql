WITH productTotals AS (
	SELECT
		products.id as "productId",
		products.name,
		SUM(quantity) as quantity,
		AVG("pricePerUnit") as "averagePricePerUnit",
		SUM(quantity * "pricePerUnit") as "productRevenue"
	FROM transaction_items
	JOIN products ON products.id = transaction_items."productId"
	GROUP BY products.id
)
SELECT
	*,
	SUM("productRevenue") OVER () AS "totalRevenue"
FROM productTotals
ORDER BY "productId" ASC;