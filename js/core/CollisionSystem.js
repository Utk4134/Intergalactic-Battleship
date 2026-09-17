export class CollisionSystem {
    static circleCircle(ax, ay, ar, bx, by, br) {
        const dx = bx - ax;
        const dy = by - ay;
        const rSum = ar + br;
        return dx * dx + dy * dy <= rSum * rSum;
    }

    static closestPointOnSegment(px, py, ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return { x: ax, y: ay };
        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        return { x: ax + t * dx, y: ay + t * dy };
    }

    static segmentCircle(ax, ay, bx, by, cx, cy, cr) {
        const closest = this.closestPointOnSegment(cx, cy, ax, ay, bx, by);
        const dx = cx - closest.x;
        const dy = cy - closest.y;
        return dx * dx + dy * dy <= cr * cr;
    }

    static checkAll(entities) {
        const collisions = [];
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const a = entities[i];
                const b = entities[j];
                if (a.faction === b.faction) continue;
                if (!a.alive || !b.alive) continue;
                if (this.circleCircle(
                    a.pos.x, a.pos.y, a.radius,
                    b.pos.x, b.pos.y, b.radius
                )) {
                    collisions.push([a, b]);
                }
            }
        }
        return collisions;
    }
}
